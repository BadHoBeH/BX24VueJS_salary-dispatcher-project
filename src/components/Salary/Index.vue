<template>
  <a-spin
    :spinning="data.length === 0">
    <div class="search">
      <a-month-picker
        :locale="locale"
        :disabledDate="disabledDate"
        v-model="month"
      />
      <a-card
        v-for="(i, k) in data"
        :key="k"
        :title="k ? get_dataUser(k) ? get_dataUser(k).NAME : `Кто-то не наш`: `${i}`"
        :style="{margin: '.5rem 0 .5rem 0', width: '100%'}"
        :bodyStyle="{padding:'0px'}"
        style="width: 100%">
        <div class="statistic">
          <a-card
            v-for="(i1, k1) in conversion(i)"
            size="small"
            :key="k1" :title="i1.title" :bordered="false">
            <a-row>
              <a-col v-if="round(i1.target ? i1.target.conversion : 0, 2) > 0" :span="4">
                <a-progress
                  type="circle"
                  :strokeColor="round(i1.target ? i1.target.conversion : 0) < 50
                  ? round(i1.target ? i1.target.conversion : 0) < 20 ? 'red' : 'yellow' : 'green'"
                  :percent="round(i1.target ? i1.target.conversion : 0, 2)" />
              </a-col>
              <a-col :span="20">
                <div v-for="(i2, k2) in i1" :key="k2">
                  <a-card-grid v-if="i2 && i2.value" :bordered="false">
                    <a-statistic
                      v-if="i2.value"
                      :title="i2.title"
                      :value="Number(i2.value)"
                      :suffix="i2.suffix === 'count'
                      ? ` / ${Number(i2.value)* (i1.target ? i1.target.rate : 0)}₽`
                      : i2.suffix"
                    />
                  </a-card-grid>
                </div>
              </a-col>
            </a-row>
          </a-card>
      </div>
        <a-collapse :bordered="false">
          <a-collapse-panel :header="'подробный отчёт'">
            <data-grid
              :dataTable="viewFormat(i.table)"
              :fields="{ind:fields}"
              :summary="summary"/>
          </a-collapse-panel>
        </a-collapse>
      </a-card>
    </div>
  </a-spin>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/ru_RU';
import { mapActions, mapGetters } from 'vuex';
import {
  forEach, groupBy, mapValues, round, sumBy,
} from 'lodash';
import moment from 'moment';
import DataGrid from '@/components/Table/Index.vue';
import { getTypeFormat } from '@/plugins/typeColumn';

const COLUMN_HIDDEN_DEFAULT = [0, 'TITLE', 'STATUS_ID', 'UF_CRM_1610526571', 'DATE_CREATE', 'target', 'untarget', 'success', 'estimate_now', 'desing_now', 'estimate_only', 'desing_only', 'salary', 'UF_CRM_1604060854', 'UF_CRM_1597071883', 'undefined'];
const COLUMN_SUM_DEFAULT = {
  sum: ['target', 'untarget', 'success', 'estimate_now', 'desing_now', 'estimate_only', 'desing_only', 'salary'],
  count: ['TITLE'],
};
const SALARIES_DEFAULT = {

};
export default {
  components: { DataGrid },
  data() {
    return {
      locale,
      salary: {
        settings: SALARIES_DEFAULT,
      },
      table: {
        fields: {
          visible: COLUMN_HIDDEN_DEFAULT,
          summary: COLUMN_SUM_DEFAULT,
          data: '',
        },
      },
      filters: {
        lead: {
          def: {},
        },
      },
      month: new Date().getDate() > 9 ? moment() : moment().subtract(1, 'months'),
      data: [],
    };
  },

  computed: {

    ...mapGetters({

      get_fieldLead: 'lead/g_fl',
      filter_dataLead: 'lead/filter',
      get_dataStage: 'stage/g_id',

      get_auth: 'auth/getAuth',
      get_dataUser: 'user/g_id',

    }),

    summary() {
      const z = [];
      forEach(this.table.fields.summary, (i, k) => {
        forEach(i, (s) => {
          z.push({
            column: s,
            showInGroupFooter: false,
            alignByColumn: true,
            valueFormat: 'fixedPoint',
            summaryType: k,
          });
        });
      });
      return z;
    },

    fields() {
      return mapValues({
        ...this.get_fieldLead('all'),
        estimate_now: { NAME: 'Ремонт/конверсия' },
        estimate_only: { NAME: 'Ремонт/выплата' },
        desing_now: { NAME: 'Дизайн/конверсия' },
        desing_only: { NAME: 'Дизайн/выплата' },
        success: { NAME: 'Продано' },
        target: { NAME: 'Целевой' },
        salary: { NAME: 'Выплата' },
        untarget: { NAME: 'Не целевой' },
      }, (i, k) => ({
        ...i,
        visible: this.table.fields.visible[0]
          ? !this.table.fields.visible.includes(k)
          : this.table.fields.visible.includes(k),
        type: getTypeFormat(i.type) === 'number' ? 'fixedPoint' : null,
        dataType: getTypeFormat(i.type),
      }));
    },

  },

  methods: {
    round,

    ...mapActions({
      get_lead: 'lead/get',
    }),

    getRate(data, current) {
      const sknebo = ((data.filter((i) => (moment(i.UF_CRM_1604060854).isSame(current, 'month') && !(moment(i.UF_CRM_1597071883).isBefore(moment(i.UF_CRM_1604060854))))
        || ((moment(i.UF_CRM_1597071883).isSame(current, 'month'))
          && !(moment(i.UF_CRM_1604060854).isBefore(moment(i.UF_CRM_1597071883))))).length) / (data.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && (i.UF_CRM_1610526571 === '1054') && !!Number(i.UF_CRM_1581944554)).length)) * 100;

      const object = ((data.filter((i) => (moment(i.UF_CRM_1611850248).isSame(current, 'month'))).length) / (data.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && (i.UF_CRM_1610526571 === '1055') && !!Number(i.UF_CRM_1581944554)).length)) * 100;
      const okna = ((data.filter((i) => (moment(i.UF_CRM_1616166187).isSame(current, 'month'))).length) / (data.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && (i.UF_CRM_1610526571 === '1361') && !!Number(i.UF_CRM_1581944554)).length)) * 100;

      return {
        sknebo: {
          conversion: sknebo,
          // eslint-disable-next-line no-nested-ternary
          rate: sknebo < 30
            // eslint-disable-next-line no-nested-ternary
            ? 150 : sknebo < 35
              // eslint-disable-next-line no-nested-ternary
              ? 200 : sknebo < 40
                // eslint-disable-next-line no-nested-ternary
                ? 250 : sknebo < 45
                  // eslint-disable-next-line no-nested-ternary
                  ? 300 : sknebo < 50
                    ? 350 : sknebo < 60
                      ? 375 : 400,
          // eslint-disable-next-line no-nested-ternary
          bonus: sknebo > 60
            ? 7000 : sknebo > 50
              ? 5000 : 0,
        },
        object: {
          conversion: object,
          // eslint-disable-next-line no-nested-ternary
          rate: object < 30
            // eslint-disable-next-line no-nested-ternary
            ? 150 : object < 35
              // eslint-disable-next-line no-nested-ternary
              ? 200 : object < 40
                // eslint-disable-next-line no-nested-ternary
                ? 250 : object < 45
                  // eslint-disable-next-line no-nested-ternary
                  ? 300 : object < 50
                    ? 350 : 350,
        },
        okna: {
          conversion: okna,
          // eslint-disable-next-line no-nested-ternary
          rate: 350,
        },
      };
    },

    conversion(data) {
      // eslint-disable-next-line no-restricted-syntax
      for (const i of data.table) {
        if (i.dateEstimatePrewDesing) i.UF_CRM_1596705191 = Number(i.UF_CRM_1596705191);
      }
      return mapValues(groupBy(data.table, 'UF_CRM_1610526571'), (i, k) => {
        // eslint-disable-next-line no-nested-ternary
        const info = (k === '1054') ? {
          success: {
            value: sumBy(i, 'success'),
            title: 'Всего успешных',
            suffix: 'count',
          },
          desing_now: {
            value: sumBy(i, 'desing_now'),
            title: 'Дизайн/конверсия',
            suffix: 'count',
          },
          estimate_now: {
            value: sumBy(i, 'estimate_now'),
            suffix: 'count',
            title: 'Замер/конверсия',
          },
          desing_only: {
            value: sumBy(i, 'desing_only'),
            suffix: 'count',
            title: 'Дизайн/выплата',
          },
          estimate_only: {
            value: sumBy(i, 'estimate_only'),
            suffix: 'count',
            title: 'Замер/выплата',
          },
          estimate_bonus: {
            value: data.conversion.sknebo.bonus,
            suffix: '₽',
            title: 'Премия',
          },
          itogo: {
            value: sumBy(i, 'success') + sumBy(i, 'estimate_only') + sumBy(i, 'desing_only'),
            suffix: 'count',
            title: 'Итоговая зарплата',
          },
          // eslint-disable-next-line no-nested-ternary
        } : (k === '1055') ? {
          headhunter_now: {
            value: sumBy(i, 'headhunter_now'),
            suffix: 'count',
            title: 'Итоговая зарплата',
          },
          headhunter_target: {
            value: sumBy(i, 'target'),
            suffix: null,
            title: 'Целевые',
          },
          headhunter_untarget: {
            value: sumBy(i, 'untarget'),
            suffix: null,
            title: 'Нецелевые',
          },
        } : (k === '1361') ? {
          success: {
            value: sumBy(i, 'success'),
            suffix: 'count',
            title: 'Итоговая зарплата',
          },
          okna_target: {
            value: sumBy(i, 'target'),
            suffix: null,
            title: 'Целевые',
          },
          okna_untarget: {
            value: sumBy(i, 'untarget'),
            suffix: null,
            title: 'Нецелевые',
          },
        } : null;
        return {
          ...info,
          title: this.get_fieldLead('UF_CRM_1610526571').items.find((i2) => i2.ID === k)
            ? this.get_fieldLead('UF_CRM_1610526571').items.find((i2) => i2.ID === k).VALUE
            : 'Структурное ответвление не выбрано',
          // eslint-disable-next-line no-nested-ternary
          target: k === '1054'
            // eslint-disable-next-line no-nested-ternary
            ? data.conversion.sknebo : k === '1055'
              ? data.conversion.object : k === '1361'
                ? data.conversion.okna : null,
        };
      });
    },

    disabledDate(current) {
      return current && current > moment();
    },

    async getDataMonth(current) {
      try {
        await this.getLeadData(current);
        const data = this.filter_dataLead('data', (i) => {
          const date = {
            create: moment(i.DATE_CREATE),
            headhunter: moment(i.UF_CRM_1611850248),
            desing: moment(i.UF_CRM_1604060854),
            okna: moment(i.UF_CRM_1616166187),
            estimate: moment(i.UF_CRM_1597071883),
          };
          return ((date.create.isSame(current, 'months'))
            || (date.headhunter.isSame(current, 'months'))
            || (date.desing.isSame(current, 'months'))
            || (date.estimate.isSame(current, 'months'))
            || (date.okna.isSame(current, 'months')));
        });
        // eslint-disable-next-line no-param-reassign
        return mapValues(groupBy(data, 'UF_CRM_1582724265'), (i) => {
          const getRate = this.getRate(i, current);
          return {
            conversion: getRate,
            table: i.map((i2) => {
              const Condition = {
                dateCreateNow: moment(i2.DATE_CREATE).isSame(current, 'month'),
                dateHhNow: moment(i2.UF_CRM_1611850248).isSame(current, 'month'),
                datOknaNow: moment(i2.UF_CRM_1616166187).isSame(current, 'month'),
                dateDesingNow: moment(i2.UF_CRM_1604060854).isSame(current, 'month'),
                dateEstimateNow: moment(i2.UF_CRM_1597071883).isSame(current, 'month'),
                dateEstimatePrewDesing: moment(i2.UF_CRM_1597071883)
                  .isSameOrBefore(moment(i2.UF_CRM_1604060854)),
                dateDesingPrewEstimate: moment(i2.UF_CRM_1604060854)
                  .isBefore(moment(i2.UF_CRM_1597071883)),
              };
              const add = {
                // eslint-disable-next-line max-len
                target: Condition.dateCreateNow && !!Number(i2.UF_CRM_1581944554) && !Number(i2.UF_CRM_5FAE552A943B9),
                // eslint-disable-next-line max-len
                untarget: !(Condition.dateCreateNow && !!Number(i2.UF_CRM_1581944554) && !Number(i2.UF_CRM_5FAE552A943B9)),
                headhunter_now: Condition.dateHhNow,
                estimate_now: Condition.dateEstimateNow && !Condition.dateDesingPrewEstimate,
                estimate_only: Condition.dateEstimateNow && Condition.dateDesingPrewEstimate,
                desing_now: Condition.dateDesingNow && !Condition.dateEstimatePrewDesing,
                okna_now: Condition.datOknaNow,
                desing_only: Condition.dateDesingNow && Condition.dateEstimatePrewDesing,
                success: (Condition.dateDesingNow && !Condition.dateEstimatePrewDesing)
                  || (Condition.dateEstimateNow && !Condition.dateDesingPrewEstimate)
                  || Condition.dateHhNow || Condition.datOknaNow,
              };
              // console.log(getRate);
              return {
                ...i2,
                ...add,
                // eslint-disable-next-line no-nested-ternary
                salary: add.headhunter_now
                  ? getRate.object.rate
                  : (add.success * getRate.sknebo.rate)
                  + (add.estimate_only * getRate.sknebo.rate)
                  + (add.desing_only * getRate.sknebo.rate),
              };
            }),
          };
        });
      } catch (e) {
        return false;
      }
    },

    viewFormat(data, fields = this.get_fieldLead) {
      return data.map((ig) => mapValues(ig, (i, k) => {
        switch (fields(k) ? fields(k).TYPE || fields(k).type : false) {
          case 'S:Date': {
            return i ? moment(i) : null;
          } case 'date': {
            return i ? moment(i) : null;
          } case 'datetime': {
            return i ? moment(i) : null;
          } case 'S:DateTime': {
            return i ? moment(i, 'DD.MM.YYYY HH:mm:ss') : null;
          } case 'S:ECrm': {
            return this.get_dealDataID(i) ? this.get_dealDataID(i).TITLE : `Не найдено [${i}]`;
          } case 'S:HTML': {
            return i.TEXT || null;
          } case 'crm_status': {
            if (k === 'STATUS_ID') return this.get_dataStage(i).NAME;
            return ' - ';
          } case 'S:employee': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.get_dataUser(i) ? this.get_dataUser(i).NAME : null : null;
          } case 'employee': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.get_dataUser(i) ? this.get_dataUser(i).NAME : null : null;
          } case 'user': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.get_dataUser(i) ? this.get_dataUser(i).NAME : null : null;
          } case 'L': {
            return fields(k).DISPLAY_VALUES_FORM[i];
          } case 'enumeration': {
            return fields(k).items.find((i2) => i2.ID === i) ? fields(k).items.find((i2) => i2.ID === i).VALUE || 'Не заполнено' : 'Не найдено';
          } default:
            break;
        }
        return i;
      }));
    },

    getFilterUser() {
      // const a = this.get_auth;
      return false;
      // return { '=UF_CRM_1582724265': a.user.ID };
    },

    async getLeadData(current) {
      const filterArray = [{
        ...this.getFilterUser(),
        '=UF_CRM_5FAE552A943B9': null,
        '>=DATE_CREATE': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
        '<=DATE_CREATE': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }, /* Дизайн */{
        ...this.getFilterUser(),
        '=UF_CRM_5FAE552A943B9': null,
        '>=UF_CRM_1604060854': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
        '<=UF_CRM_1604060854': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }, /* Замер-ремонт */{
        ...this.getFilterUser(),
        '=UF_CRM_5FAE552A943B9': null,
        '>=UF_CRM_1597071883': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
        '<=UF_CRM_1597071883': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }, /* Окна */{
        ...this.getFilterUser(),
        '>=UF_CRM_1616166187': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
        '<=UF_CRM_1616166187': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }, /* Собесы */{
        ...this.getFilterUser(),
        '>=UF_CRM_1611850248': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
        '<=UF_CRM_1611850248': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }];
      const selectArray = ['ID', 'TITLE', 'STATUS_ID', 'STATUS_SEMANTIC_ID', 'DATE_CREATE', 'UF_*'];
      return Promise.all(filterArray.map(async (i) => this.get_lead({
        FILTER: i,
        select: selectArray,
        key: 'ID',
      }))).then(() => true).catch(() => false);
    },

  },

  watch: {
    month: {
      async handler() {
        this.data = await this.getDataMonth(this.month);
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.statistic{
  margin: 1rem;
}
</style>
