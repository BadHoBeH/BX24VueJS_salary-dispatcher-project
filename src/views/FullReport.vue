<template>
  <a-spin
    :spinning="data === null">
    <div class="search">
      <a-month-picker
        :locale="locale"
        :disabledDate="disabledDate"
        v-model="month"
      />
      <a-card
        v-if="data"
        :title="`Статистическая сводная по отделу`"
        :style="{margin: '.5rem 0 .5rem 0', width: '100%'}"
        :bodyStyle="{padding:'0px'}"
        style="width: 100%">
        <div class="statistic">
          <a-card
            v-for="(i1, k1) in conversion(data)"
            size="small"
            :key="k1" :title="i1.title" :bordered="false">
            <a-row>
              <a-col v-if="round(i1.target ? i1.target.conversion : 0, 2)" :span="4">
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
                      :value="Number(i2.value.v || i2.value)"
                      :suffix="i2.value.sf && `${i2.value.sf} ${Number(i2.value.sfv)}`"
                    />
                  </a-card-grid>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </div>
      </a-card>

        <data-grid
          v-if="data"
          :dataTable="viewFormat(data.table)"
          :fields="{ind:fields}"
          :summary="summary"
        />
    </div>
  </a-spin>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/ru_RU';
import { mapActions, mapGetters } from 'vuex';
import {
  forEach, groupBy, includes, mapValues, round, sumBy,
} from 'lodash';
import moment from 'moment';
import DataGrid from '@/components/Table/Index.vue';
import { getTypeFormat } from '@/plugins/typeColumn';

const STR_BRANCH_FLD = 'UF_STRUCTURAL_BRANCH';
const COLUMN_HIDDEN_DEFAULT = [0, 'TITLE', 'title_url', 'STATUS_ID', STR_BRANCH_FLD, 'ASSIGNED_BY_ID', 'UF_CRM_1582724265', 'DATE_CREATE', STR_BRANCH_FLD, 'target', 'untarget', 'success', 'estimate_now', 'desing_now', 'estimate_only', 'desing_only', 'salary', 'UF_CRM_1611850248', 'UF_CRM_1604060854', 'UF_CRM_1597071883', 'undefined'];
const COLUMN_SUM_DEFAULT = {
  sum: ['target', 'success', 'untarget', 'estimate_now', 'desing_now', 'estimate_only', 'desing_only', 'salary'],
  count: ['TITLE'],
};
const STR_BRANCH_LIST = {
  okna: '98262',
  otk: '137923',
  colbase: '139901',
  obt: '73095',
  skn: '194',
};

const SALARIES_DEFAULT = {

};
export default {
  components: { DataGrid },
  data() {
    return {
      STR_BRANCH_FLD,
      STR_BRANCH_LIST,
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

      get_auth: 'auth/getAuth',
      get_dataUser: 'user/g_id',
      get_dataStage: 'stage/g_id',

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
        title_url: { NAME: 'ID URL', template: 'urllink' },
        estimate_only: { NAME: 'Ремонт/выплата' },
        desing_now: { NAME: 'Дизайн/конверсия' },
        desing_only: { NAME: 'Дизайн/выплата' },
        success: { NAME: 'Продано' },
        target: { NAME: 'Целевой' },
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
          && !(moment(i.UF_CRM_1604060854).isBefore(moment(i.UF_CRM_1597071883))))).length) / (data.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && (i.UF_CRM_1610526571 === this.STR_BRANCH_LIST.skn) && !!Number(i.UF_CRM_1581944554)).length)) * 100;

      // eslint-disable-next-line max-len
      const objectTemp = data.filter((i) => includes([this.STR_BRANCH_LIST.otk, this.STR_BRANCH_LIST.obt], i.UF_CRM_1610526571)); // Только те, которые подходят по структурным
      const objectSucc = objectTemp.filter((i) => moment(i.UF_CRM_1611850248).isSame(current, 'month')); // Только успешные
      const objectTarg = objectTemp.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && !!Number(i.UF_CRM_1581944554)); // Только целевые
      const object = (objectSucc.length / objectTarg.length) * 100;

      // eslint-disable-next-line max-len
      const coldBaseTemp = data.filter((i) => includes([this.STR_BRANCH_LIST.colbase], i.UF_CRM_1610526571)); // Только те, которые подходят по структурным
      const coldBaseSucc = coldBaseTemp.filter((i) => moment(i.UF_CRM_1611850248).isSame(current, 'month')); // Только успешные
      const coldBaseTarg = coldBaseTemp.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && !!Number(i.UF_CRM_1581944554)); // Только целевые
      const coldBase = (coldBaseSucc.length / coldBaseTarg.length) * 100;

      const okna = ((data.filter((i) => (moment(i.UF_CRM_1616166187).isSame(current, 'month'))).length) / (data.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && (i.UF_CRM_1610526571 === this.STR_BRANCH_LIST.okna) && !!Number(i.UF_CRM_1581944554)).length)) * 100;

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
                    ? 350 : 375,
        },
        okna: {
          conversion: okna,
          rate: 350,
        },
        coldBase: {
          conversion: coldBase,
          rate: 350,
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
      };
    },

    conversion(data) {
      // eslint-disable-next-line no-restricted-syntax
      for (const i of data.table) {
        const strBranch = i.UF_CRM_1610526571;
        if (i.dateEstimatePrewDesing) i.UF_CRM_1596705191 = Number(i.UF_CRM_1596705191);
        i.structure = strBranch === this.STR_BRANCH_LIST.otk ? this.STR_BRANCH_LIST.obt : strBranch;
      }
      return mapValues(groupBy(data.table, 'structure'), (i, k) => {
        // eslint-disable-next-line no-nested-ternary
        const info = (k === this.STR_BRANCH_LIST.skn) ? {
          desing_now: {
            value: sumBy(i, 'desing_now'),
            title: 'Дизайн/конверсия',
            suffix: 'proc',
          },
          desing_only: {
            value: sumBy(i, 'desing_only'),
            title: 'Дизайн/выплата',
          },
          estimate_now: {
            value: sumBy(i, 'estimate_now'),
            title: 'Замер/конверсия',
          },
          estimate_only: {
            value: sumBy(i, 'estimate_only'),
            title: 'Замер/выплата',
          },
          success: {
            value: {
              v: sumBy(i, 'success'),
              sf: '/',
              sfv: sumBy(i, 'untarget_m') + sumBy(i, 'target'),
            },
            title: 'Всего успешных / Всего',
          },
          itogo: {
            value: {
              v: sumBy(i, 'target'),
              sf: '/',
              sfv: sumBy(i, 'untarget_m'),
            },
            title: 'Целевые / нецелевые',
          },
          // eslint-disable-next-line no-nested-ternary,max-len
        } : (k === this.STR_BRANCH_LIST.obt || k === this.STR_BRANCH_LIST.otk || k === this.STR_BRANCH_LIST.colbase) ? {
          headhunter_now: {
            value: sumBy(i, 'headhunter_now'),
            title: 'Собеседование',
          },
          headhunter_target: {
            value: sumBy(i, 'target'),
            title: 'Целевые',
          },
          headhunter_untarget: {
            value: sumBy(i, 'untarget'),
            title: 'Нецелевые',
          },
        } : (k === this.STR_BRANCH_LIST.okna) ? {
          success: {
            value: sumBy(i, 'success'),
            title: 'Успешных',
          },
          okna_target: {
            value: sumBy(i, 'target'),
            title: 'Целевые',
          },
          okna_untarget: {
            value: sumBy(i, 'untarget'),
            title: 'Нецелевые',
          },
        } : null;
        return {
          ...info,
          title: this.get_fieldLead(STR_BRANCH_FLD).items.find((i2) => i2.ID === k)
            ? this.get_fieldLead(STR_BRANCH_FLD).items.find((i2) => i2.ID === k).VALUE
            : 'Структурное подразделение не выбрано',
          // eslint-disable-next-line no-nested-ternary
          target: k === this.STR_BRANCH_LIST.skn
            // eslint-disable-next-line no-nested-ternary
            ? data.conversion.sknebo : k === this.STR_BRANCH_LIST.obt
              // eslint-disable-next-line no-nested-ternary
              ? data.conversion.object : k === this.STR_BRANCH_LIST.colbase
                ? data.conversion.coldBase : k === this.STR_BRANCH_LIST.okna
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
        const getRate = this.getRate(data, current);
        return {
          conversion: {
            sknebo: getRate.sknebo,
            object: getRate.object,
            okna: getRate.okna,
            coldBase: getRate.coldBase,
          },
          table: data.map((i2) => {
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
              title_url: {
                url: `https://crm.sknebo.ru/crm/lead/details/${i2.ID}/`,
                title: i2.TITLE,
              },
              // eslint-disable-next-line max-len
              target: Condition.dateCreateNow && !!Number(i2.UF_CRM_1581944554) && !Number(i2.UF_CRM_5FAE552A943B9),
              untarget_m: (Condition.dateCreateNow && !Number(i2.UF_CRM_1581944554)),
              // eslint-disable-next-line max-len
              untarget: !(Condition.dateCreateNow && !!Number(i2.UF_CRM_1581944554) && !Number(i2.UF_CRM_5FAE552A943B9)),
              headhunter_now: Condition.dateHhNow,
              estimate_now: Condition.dateEstimateNow && !Condition.dateDesingPrewEstimate,
              estimate_only: Condition.dateEstimateNow && Condition.dateDesingPrewEstimate,
              desing_now: Condition.dateDesingNow && !Condition.dateEstimatePrewDesing,
              desing_only: Condition.dateDesingNow && Condition.dateEstimatePrewDesing,
              success: (Condition.dateDesingNow && !Condition.dateEstimatePrewDesing)
                || (Condition.dateEstimateNow && !Condition.dateDesingPrewEstimate)
                || Condition.dateHhNow || Condition.datOknaNow,
            };
            return {
              ...i2,
              ...add,
            };
          }),
        };
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
          } case 'crm_multifield': {
            return i.map((i3) => i3.VALUE.replace(/\D/g, '').replace(/^8/, '7')).join(', ');
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
      return false;
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
      }, /* Окна ОКА */{
        ...this.getFilterUser(),
        '>=UF_CRM_1616166187': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
        '<=UF_CRM_1616166187': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }, /* Собеседования (все) */{
        ...this.getFilterUser(),
        '>=UF_CRM_1611850248': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
        '<=UF_CRM_1611850248': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }];
      const selectArray = ['*', 'PHONE', 'UF_*'];
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
        this.data = null;
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
