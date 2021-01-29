<template>
  <a-spin
    :spinning="Boolean(loadingData)"
    :tip="(loadingData > 1) ? `Осталось загрузить модулей: ${loadingData}` : `Почти всё`">
      <div class="search">
        <a-button @click="click()" icon="search" style="margin: .5rem">Найти</a-button>
        <a-month-picker
          :locale="locale"
          :disabledDate="disabledDate"
          v-model="month"
        />
        <a-card
          v-for="(i, k) in data"
          :key="k"
          :title="k !== 'null' ? get_user(k).NAME : 'Кто-то не наш'"
          :style="{margin: '.5rem 0 .5rem 0', width: '100%'}"
          :bodyStyle="{padding:'0px'}"
          style="width: 100%">
          <div class="statistic">
            <a-row>
              <a-col :span="12">
                пусто..
              </a-col>
              <a-col :span="12">
                <a-row>
                  <a-col :span="12">
                    <a-statistic
                      title="Вышло / выдано всего"
                      :value="exitMasters(i.map((i2) => i2.t_masterDetail))"
                      :suffix="` / ${sumBy(i, 'MASTER_COUNT')}`"
                    />
                  </a-col>
                  <a-col :span="12">
                    <a-statistic
                      title="Зарплата итог"
                      :value="sumBy(i, 'SALARY')"
                      :suffix="` руб`"/>
                  </a-col>
                </a-row>
                <a-row>
                    <a-card-grid
                      style="position: center"
                      v-for="(i2, k2) in masterExit(k ,i)"
                      :key="k2"
                    >
                      {{ i2.title }}: {{ i2.value }}
                    </a-card-grid>
                </a-row>
              </a-col>
            </a-row>
          </div>
          <a-collapse :bordered="false">
            <a-collapse-panel :header="'подробный отчёт'">
              <data-grid
                :dataTable="i"
                :fields="{ind:fields, sub:subfields}"
                :summary="summary"/>
            </a-collapse-panel>
          </a-collapse>
        </a-card>
      </div>
  </a-spin>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/ru_RU';
import DataGrid from '@/components/Table/Index.vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  concat,
  findIndex,
  flatten,
  forEach,
  groupBy,
  mapKeys,
  mapValues,
  maxBy,
  merge,
  minBy,
  sum,
  sumBy,
} from 'lodash';
// eslint-disable-next-line no-unused-vars
import moment from 'moment';
import { getTypeFormat } from '@/plugins/typeColumn';

/**
 * CONST
 */
const ID_LIST_DEFAULT = 68;
const COLUMN_HIDDEN_DEFAULT = ['PROPERTY_533', 'PROPERTY_548', 'PROPERTY_534', 'PROPERTY_547', 'ID', 'undefined'];
const COLUMN_SUM_DEFAULT = {
  sum: ['COUNT_MASTERS', 'SALARY'],
  count: ['TITLE'],
};
const SALARIES_DEFAULT = {
  closed: [206, 207],
  all: {
    title: 'Доезды',
    pay: 100,
    result: [206, 207, 209],
  },
  others: {
    title: 'Остальные',
    pay: 100,
    result: [206, 207],
  },
  1: {
    title: 'с 1-го раза',
    pay: 900,
    result: [206, 207],
  },
  2: {
    title: 'с 2-го раза',
    pay: 400,
    result: [206, 207],
  },
};
const ADDED_DAYS = 7;

export default {
  components: { DataGrid },
  data() {
    return {
      locale,
      block: {
        master: {
          id: ID_LIST_DEFAULT,
        },
      },
      salary: {
        settings: SALARIES_DEFAULT,
        addDays: ADDED_DAYS,
      },
      table: {
        fields: {
          visible: COLUMN_HIDDEN_DEFAULT,
          summary: COLUMN_SUM_DEFAULT,
        },
      },
      filters: {
        list: {
          68: {
            IBLOCK_TYPE_ID: 'lists',
            IBLOCK_ID: ID_LIST_DEFAULT,
            key: 'ID',
          },
        },
        user: {
          select: ['ID', 'NAME', 'UF_DEPARTMENT', 'WORK_POSITION'],
          key: 'ID',
        },
      },
      month: new Date().getDate() > 16 ? moment() : moment().subtract(1, 'months'),
      data: [],
    };
  },

  computed: {

    ...mapState({
      getListLoading: (state) => state.list.all.loading,
      getDealLoading: (state) => state.deal.all.loading,
      getUserLoading: (state) => state.user.all.loading,

      list_data: (state) => state.list.all.data,
      deal_data: (state) => state.deal.all.data,
    }),

    fields() {
      return mapValues({
        TITLE: { NAME: 'Заявка' },
        UF_CRM_1600688263: { NAME: 'Диспетчер по заявке' },
        MASTER_COUNT: { NAME: 'Мастеров выдано' },
        SUCCESS_MASTER: { NAME: 'С какого раза мастер вышел' },
        SALARY: { NAME: 'Зарплата' },
        DATE_CREATE: { NAME: 'Дата создания', TYPE: 'datetime' },
        CLOSEDATE: { NAME: 'Дата закрытия', TYPE: 'date' },
        CLOSE_TIME: { NAME: 'За сколько дней закрыта' },
      }, (i, k) => ({
        ...i,
        visible: !this.table.fields.visible.includes(k),
        type: getTypeFormat(i.TYPE) === 'number' ? 'fixedPoint' : null,
        dataType: getTypeFormat(i.TYPE),
      }));
    },

    subfields() {
      return mapValues({
        ...this.get_fieldList(this.block.master.id),
      }, (i, k) => ({
        ...i,
        visible: !this.table.fields.visible.includes(k),
        type: getTypeFormat(i.TYPE) === 'number' ? 'fixedPoint' : null,
        dataType: getTypeFormat(i.TYPE),
      }));
    },

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

    loadingData() {
      return sum([this.getListLoading, this.getDealLoading, this.getUserLoading]);
    },

    ...mapGetters({
      get_listDataFilter: 'list/getListDataFilter',

      get_fieldList: 'list/getListFieldsType',
      get_fieldDeal: 'deal/getFieldsType',

      get_dealDataID: 'deal/getDealDataID',

      get_user: 'user/getUser',
      get_user_auth: 'auth/getUser',
    }),
  },

  methods: {

    /*
    * Import methods lodash
    */

    merge,
    groupBy,
    findIndex,
    sumBy,
    sum,
    forEach,
    mapValues,
    minBy,
    maxBy,
    concat,
    flatten,
    mapKeys,

    /*
    * Map Actions
    */

    ...mapActions({
      get_userData: 'user/get',

      get_dealData: 'deal/get',
      get_listData: 'list/get',

      get_listFields: 'list/fields',
      get_dealFields: 'deal/fields',
    }),

    click() {
      console.log(this.$watch('month'));
    },

    async funcName(current) {
      try {
        await this.getListData(current);
        const selectCurrent = Object.values(this.list_data).filter((i) => {
          const date = {
            create: moment(i.PROPERTY_549, 'DD.MM.YYYY'),
            closed: moment(i.PROPERTY_550, 'DD.MM.YYYY'),
          };
          const condition = {
            createNow: (date.create >= moment(current).clone().startOf('month') && date.create <= moment(current).clone().endOf('month')),
            createPrev: (date.create >= moment(current).clone().startOf('month').add('months', -1) && date.create <= moment(current).clone().endOf('month').add('months', -1)),
            createBefPrev: (date.create < moment(current).clone().startOf('month').add('months', -1)),

            closeNow: (date.closed >= moment(current).clone().startOf('month') && date.closed <= moment(current).clone().endOf('month')),
            closeDNow: (date.closed >= moment(current).clone().startOf('month') && date.closed <= moment(current).clone().endOf('month').add('days', this.salary.addDays)),
            closeYNow: (date.closed >= moment(current).clone().startOf('month').add('days', this.salary.addDays) && date.closed <= moment(current).clone().endOf('month')),

            /**
             * Описание констант
             * createNow: Создан в текущем месяце с начала месяца, по конец месяца
             * createPrev: Создан в предыдущем месяце с начала месяца, по конец месяца
             * createBefPrev: Создан ранее предыдущего месяца
             * closeNow: Закрыт в текущем месяце с начала месяца, по конец месяца
             * closeDNow: Закрыт в текущем отчётном периоде с начала месяца по конец месяца+n (дней)
             * closeYNow: Закрыт в догоняющим с начала месяца+n (дней), по конец месяца
             */
          };
          return ((condition.createNow && condition.closeDNow)
            || (condition.createPrev && condition.closeYNow)
            || (condition.createBefPrev && condition.closeNow)
            || (condition.createNow && !(date.closed > 0)));
        });
        // eslint-disable-next-line no-restricted-syntax
        for (const i of selectCurrent) i.PROPERTY_549 = moment(i.PROPERTY_549, 'DD.MM.YYYY');
        const currentDeal = [minBy(selectCurrent, 'PROPERTY_549').PROPERTY_549, maxBy(selectCurrent, 'PROPERTY_549').PROPERTY_549];
        await this.getDealData(currentDeal);
        return mapValues(groupBy(selectCurrent, 'PROPERTY_536'), (i, kp) => Object.values(mapValues(groupBy(i, 'PROPERTY_533'), (i2, k) => {
          const dealInfo = this.get_dealDataID(k) || null;
          // eslint-disable-next-line no-nested-ternary
          const closingTime = dealInfo
            ? dealInfo.CLOSEDATE
              ? moment(dealInfo.CLOSEDATE)
                .diff(moment(dealInfo.DATE_CREATE), 'days')
              : 'Заявка не закрыта' : 'Сделка удалена';
          const gradeMasters = this.gradeMasters(i2) === null ? null : this.gradeMasters(i2);
          return {
            ...this.setFormatFields([dealInfo], this.get_fieldDeal())[0],
            ...mapKeys(dealInfo, (i3, k3) => `t_${k3}`),
            CLOSE_TIME: closingTime,
            // eslint-disable-next-line no-nested-ternary
            SUCCESS_MASTER: (closingTime !== 'Сделка удалена') ? (dealInfo && dealInfo.UF_CRM_1600688263 === kp) ? (gradeMasters === null ? 'Не вышел' : gradeMasters + 1) : `Заявка ${dealInfo.UF_CRM_1600688263 ? this.get_user(dealInfo.UF_CRM_1600688263).NAME : 'без диспетчера'}` : null,
            MASTER_COUNT: i2.length,
            SALARY: this.getSalary(i2, gradeMasters, dealInfo),
            masterDetail: this.setFormatFields(i2, this.get_fieldList(this.block.master.id)),
            t_masterDetail: i2,
          };
        })));
      } catch (e) {
        return e;
      }
    },

    getSalary(masters, grade, deal) {
      if ((masters.length && deal)) {
        // console.log(masters, grade, deal);
        return masters.reduce((itog, curr) => {
          let z = itog;
          if (this.salary.settings.all.result
            .includes(Number(curr.PROPERTY_542))) z += this.salary.settings.all.pay;
          if (this.salary.settings.closed
            .includes(Number(curr.PROPERTY_542))) {
            // console.log(this.salary.settings[grade + 1], grade + 1);
            z += this.salary.settings[grade + 1]
              ? this.salary.settings[grade + 1].pay
              : this.salary.settings.others.pay;
          }
          // console.log(z, itog, grade);
          return z;
        }, 0);
      }
      return null;
    },

    exitMasters(masters) {
      return flatten(masters)
        .filter((i) => this.salary.settings.all.result
          .includes(Number(i.PROPERTY_542))).length;
    },

    masterExit(user, deal) {
      // eslint-disable-next-line no-sequences,no-return-assign
      const DEF_ARRAY = Object.keys(this.salary.settings).filter((i) => Number.isInteger(Number(i)) || i === 'others' || i === 'all').reduce((acc, n) => (acc[n] = { value: null, title: this.salary.settings[n].title }, acc), {});
      return deal.reduce((itog, curr) => {
        const z = itog;
        const masters = curr.t_masterDetail;
        const filterDeal = masters
          .filter((i3) => this.salary.settings.all.result.includes(Number(i3.PROPERTY_542)));
        const gradeMasters = this.gradeMasters(masters) === null
          ? null : this.gradeMasters(masters);
        if (curr.t_UF_CRM_1600688263 === user && gradeMasters !== null) {
          z[z[gradeMasters + 1] === undefined ? 'others' : gradeMasters + 1].value += 1;
        }
        z.all.value += filterDeal.length;
        return z;
      }, DEF_ARRAY);
    },

    setFormatFields(data, fields) {
      // eslint-disable-next-line no-restricted-syntax
      return data.map((ig) => mapValues(ig, (i, k) => {
        switch (fields[k] ? fields[k].TYPE || fields[k].type : false) {
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
          } case '': {
            return this.get_dealDataID(i) ? this.get_dealDataID(i).TITLE : `Не найдено [${i}]`;
          } case 'S:HTML': {
            return i.TEXT || null;
          } case 'S:employee': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.get_user(i) ? this.get_user(i).NAME : null : null;
          } case 'employee': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.get_user(i) ? this.get_user(i).NAME : null : null;
          } case 'user': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.get_user(i) ? this.get_user(i).NAME : null : null;
          } case 'L': {
            return fields[k].DISPLAY_VALUES_FORM[i];
          } default:
            break;
        }
        return i;
      }));
    },

    gradeMasters(masters) {
      if (masters) {
        // eslint-disable-next-line no-restricted-syntax,max-len
        for (const key in masters) if (this.salary.settings.closed.includes(Number(masters[key].PROPERTY_542))) return Number(key);
      }
      return null;
    },

    disabledDate(current) {
      return current && current > moment();
    },

    async getDealData(current) {
      const filterArray = [{
        CATEGORY_ID: 3,
        '=UF_CRM_1600702856': null,
        '>=DATE_CREATE': moment(current[0]).format('DD.MM.YYYY'),
        '<=DATE_CREATE': moment(current[1]).format('DD.MM.YYYY'),
      }];
      return Promise.all(filterArray.map(async (i) => this.get_dealData({
        filter: i,
        select: ['ID', 'TITLE', 'DATE_CREATE', 'CLOSEDATE', 'UF_CRM_1600688263'],
        key: 'ID',
      }))).then(() => true).catch(() => false);
    },

    async getListData(current) {
      const filterArray = [{
        '>=PROPERTY_550': moment(current).clone().startOf('month')
          .add('days', this.salary.addDays)
          .format('DD.MM.YYYY HH:mm:ss'),
        '<=PROPERTY_550': moment(current).clone().endOf('month')
          .add('days', this.salary.addDays)
          .format('DD.MM.YYYY HH:mm:ss'),
        '<PROPERTY_549': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }, {
        '>=PROPERTY_549': moment(current).clone().startOf('month').format('DD.MM.YYYY HH:mm:ss'),
        '<=PROPERTY_549': moment(current).clone().endOf('month').format('DD.MM.YYYY HH:mm:ss'),
      }];
      return Promise.all(filterArray.map(async (i) => this.get_listData({
        IBLOCK_TYPE_ID: 'lists',
        IBLOCK_ID: this.block.master.id,
        FILTER: i,
        key: 'ID',
      }))).then(() => true).catch(() => false);
    },

  },

  async mounted() {
    await this.get_userData(this.filters.user);
    await this.get_listFields(this.filters.list[this.block.master.id]);
    await this.get_dealFields({ key: 'default' });
  },

  watch: {
    month: {
      async handler() {
        this.data = await this.funcName(this.month);
        // console.log(this.data);
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
