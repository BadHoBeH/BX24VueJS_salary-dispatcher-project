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
              <a-col :span="4">
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
  forEach, groupBy, mapValues, round, sumBy, includes,
} from 'lodash';
import moment from 'moment';
import DataGrid from '@/components/Table/Index.vue';
import { getTypeFormat } from '@/plugins/typeColumn';

const STR_BRANCH_FLD = 'UF_STRUCTURAL_BRANCH';

const COLUMN_HIDDEN_DEFAULT = [0, 'TITLE', 'STATUS_ID', STR_BRANCH_FLD, 'DATE_CREATE', 'target', 'untarget', 'success', 'estimate_now', 'desing_now', 'estimate_only', 'desing_only', 'salary', 'UF_CRM_1604060854', 'UF_CRM_1597071883', 'undefined'];
const COLUMN_SUM_DEFAULT = {
  sum: ['target', 'untarget', 'success', 'estimate_now', 'desing_now', 'estimate_only', 'desing_only', 'salary'],
  count: ['TITLE'],
};
const SALARIES_DEFAULT = {

};
const STR_BRANCH_LIST = {
  okna: '98262',
  otk: '137923',
  colbase: '139901',
  obt: '73095',
  skn: '194',
  ske: '209108',
};

const STR_BRANCH_TITLE = {
  98262: 'Окна Небо',
  137923: 'Мастера Отклики',
  139901: 'Холодная база',
  73095: 'Мастера Объект',
  194: 'СК Небо',
  209108: 'СК Эталон',
};

export default {
  components: { DataGrid },
  data() {
    return {
      locale,
      STR_BRANCH_FLD,
      STR_BRANCH_LIST,
      STR_BRANCH_TITLE,
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
    includes,

    ...mapActions({
      get_lead: 'lead/get',
    }),

    getRate(data, current) {
      const arr = {
        sknebo: {
          s: data.filter((i) => (i[STR_BRANCH_FLD] === this.STR_BRANCH_LIST.skn) && ((moment(i.UF_CRM_1604060854).isSame(current, 'month') && !(moment(i.UF_CRM_1597071883).isBefore(moment(i.UF_CRM_1604060854))))
            || ((moment(i.UF_CRM_1597071883).isSame(current, 'month')) && !(moment(i.UF_CRM_1604060854).isBefore(moment(i.UF_CRM_1597071883)))))),
          a: data.filter((i) => i[STR_BRANCH_FLD] === this.STR_BRANCH_LIST.skn && moment(i.DATE_CREATE).isSame(current, 'month') && !!Number(i.UF_CRM_1581944554)),
        },
        sketal: {
          s: data.filter((i) => (i[STR_BRANCH_FLD] === this.STR_BRANCH_LIST.ske) && ((moment(i.UF_CRM_1604060854).isSame(current, 'month') && !(moment(i.UF_CRM_1597071883).isBefore(moment(i.UF_CRM_1604060854))))
            || ((moment(i.UF_CRM_1597071883).isSame(current, 'month')) && !(moment(i.UF_CRM_1604060854).isBefore(moment(i.UF_CRM_1597071883)))))),
          a: data.filter((i) => i[STR_BRANCH_FLD] === this.STR_BRANCH_LIST.ske && moment(i.DATE_CREATE).isSame(current, 'month') && !!Number(i.UF_CRM_1581944554)),
        },
      };

      const sknebo = (arr.sknebo.s.length / arr.sknebo.a.length) * 100;
      const sketal = (arr.sketal.s.length / arr.sketal.a.length) * 100;

      // eslint-disable-next-line max-len
      const objectTemp = data.filter((i) => includes([this.STR_BRANCH_LIST.otk, this.STR_BRANCH_LIST.obt], i[STR_BRANCH_FLD])); // Только те, которые подходят по структурным
      const objectSucc = objectTemp.filter((i) => moment(i.UF_CRM_1611850248).isSame(current, 'month')); // Только успешные
      const objectTarg = objectTemp.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && !!Number(i.UF_CRM_1581944554)); // Только целевые
      const object = (objectSucc.length / objectTarg.length) * 100;

      // eslint-disable-next-line max-len
      const coldBaseTemp = data.filter((i) => includes([this.STR_BRANCH_LIST.colbase], i[STR_BRANCH_FLD])); // Только те, которые подходят по структурным
      const coldBaseSucc = coldBaseTemp.filter((i) => moment(i.UF_CRM_1611850248).isSame(current, 'month')); // Только успешные
      const coldBaseTarg = coldBaseTemp.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && !!Number(i.UF_CRM_1581944554)); // Только целевые
      const coldBase = (coldBaseSucc.length / coldBaseTarg.length) * 100;

      const okna = ((data.filter((i) => (moment(i.UF_CRM_1616166187).isSame(current, 'month'))).length) / (data.filter((i) => moment(i.DATE_CREATE).isSame(current, 'month') && (i[STR_BRANCH_FLD] === this.STR_BRANCH_LIST.okna) && !!Number(i.UF_CRM_1581944554)).length)) * 100;

      /* eslint-disable no-nested-ternary */

      return {
        sknebo: {
          conversion: sknebo,
          rate: sknebo < 30
            ? 150 : sknebo < 35
              ? 200 : sknebo < 40
                ? 250 : sknebo < 45
                  ? 300 : sknebo < 50
                    ? 350 : sknebo < 60
                      ? 375 : 400,
          bonus: sknebo > 60
            ? 7000 : sknebo > 50
              ? 5000 : 0,
        },
        sketal: {
          conversion: sketal,
          rate: sketal < 30
            ? 150 : sketal < 35
              ? 200 : sketal < 40
                ? 250 : sketal < 45
                  ? 300 : sketal < 50
                    ? 350 : sketal < 60
                      ? 375 : 400,
          bonus: sketal > 60
            ? 7000 : sketal > 50
              ? 5000 : 0,
        },
        object: {
          conversion: object,
          rate: object < 30
            ? 150 : object < 35
              ? 200 : object < 40
                ? 250 : object < 45
                  ? 300 : object < 50
                    ? 350 : 350,
        },
        okna: {
          conversion: okna,
          rate: 350,
        },
        coldBase: {
          conversion: coldBase,
          rate: 300,
        },
      };
    },

    conversion(data) {
      // eslint-disable-next-line no-restricted-syntax
      for (const i of data.table) {
        const strBranch = i[STR_BRANCH_FLD];
        if (i.dateEstimatePrewDesing) i.UF_CRM_1596705191 = Number(i.UF_CRM_1596705191);
        i.structure = strBranch === this.STR_BRANCH_LIST.otk ? this.STR_BRANCH_LIST.obt : strBranch;
      }
      return mapValues(groupBy(data.table, 'structure'), (i, k) => {
        // eslint-disable-next-line no-nested-ternary
        const info = (k === this.STR_BRANCH_LIST.skn) ? {
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
          main_target: {
            value: sumBy(i, 'target'),
            suffix: null,
            title: 'Целевые',
          },
          main_untarget: {
            value: sumBy(i, 'untarget'),
            suffix: null,
            title: 'Нецелевые',
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
        } : (k === this.STR_BRANCH_LIST.ske) ? {
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
          main_target: {
            value: sumBy(i, 'target'),
            suffix: null,
            title: 'Целевые',
          },
          main_untarget: {
            value: sumBy(i, 'untarget'),
            suffix: null,
            title: 'Нецелевые',
          },
          estimate_only: {
            value: sumBy(i, 'estimate_only'),
            suffix: 'count',
            title: 'Замер/выплата',
          },
          estimate_bonus: {
            value: data.conversion.sketal.bonus,
            suffix: '₽',
            title: 'Премия',
          },
          itogo: {
            value: sumBy(i, 'success') + sumBy(i, 'estimate_only') + sumBy(i, 'desing_only'),
            suffix: 'count',
            title: 'Итоговая зарплата',
          },
          // eslint-disable-next-line no-nested-ternary
        } : (k === this.STR_BRANCH_LIST.obt || k === this.STR_BRANCH_LIST.colbase) ? {
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
        } : (k === this.STR_BRANCH_LIST.okna) ? {
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
          // eslint-disable-next-line no-nested-ternary
          title: this.STR_BRANCH_TITLE[k] || 'Структурное ответвление не определено',
          // eslint-disable-next-line no-nested-ternary
          target: k === this.STR_BRANCH_LIST.skn
            // eslint-disable-next-line no-nested-ternary
            ? data.conversion.sknebo : k === this.STR_BRANCH_LIST.ske
              // eslint-disable-next-line no-nested-ternary
              ? data.conversion.sketal : k === this.STR_BRANCH_LIST.obt
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
                target: Condition.dateCreateNow && !!Number(i2.UF_CRM_1581944554)
                  && !Number(i2.UF_CRM_5FAE552A943B9),
                untarget: !(Condition.dateCreateNow && !!Number(i2.UF_CRM_1581944554)
                  && !Number(i2.UF_CRM_5FAE552A943B9)),
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
              return {
                ...i2,
                ...add,
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

    /**
     *  Обработчик форматов
     */
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
            if (k === 'STATUS_ID') return this.get_dataStage(i) ? this.get_dataStage(i).NAME : null;
            return ' - ';
          } case 'iblock_element': {
            // eslint-disable-next-line no-unused-expressions
            if (k === 'UF_STRUCTURAL_BRANCH') return this.STR_BRANCH_TITLE[i] || 'Структурное ответвление не определено';
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

    /**
     * Пользовательские фильтры
     */
    getFilterUser() {
      return false;
    },

    /**
     *  получение всех необходимых лидов.
     */
    async getLeadData(current) {
      const filterArray = [
        /* Все лиды */
        {
          ...this.getFilterUser(),
          '=UF_CRM_5FAE552A943B9': null,
          '>=DATE_CREATE': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
          '<=DATE_CREATE': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
        },
        /* Дизайн */
        {
          ...this.getFilterUser(),
          '=UF_CRM_5FAE552A943B9': null,
          '>=UF_CRM_1604060854': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
          '<=UF_CRM_1604060854': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
        },
        /* Замер-ремонт */
        {
          ...this.getFilterUser(),
          '=UF_CRM_5FAE552A943B9': null,
          '>=UF_CRM_1597071883': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
          '<=UF_CRM_1597071883': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
        },
        /* Окна */
        {
          ...this.getFilterUser(),
          '>=UF_CRM_1616166187': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
          '<=UF_CRM_1616166187': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
        },
        /* Собесы */
        {
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
