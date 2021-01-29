<template>
  <a-spin
    :spinning="Boolean(loadingData)"
    :tip="(loadingData > 1) ? `Осталось загрузить модулей: ${loadingData}` : `Почти всё`">
      <div class="search">
        <a-button @click="getData(month)" icon="search" style="margin: .5rem">Найти</a-button>
        <a-month-picker
          :locale="locale"
          :disabledDate="disabledDate"
          v-model="month"
        />
      </div>
      <a-card
        v-for="(i, k) in groupBy(data, 'HR_DISPATCH_NAME')"
        :key="k"
        :title="k !== 'null' ? k : 'Никто не выдал'"
        :style="{margin: '.5rem 0 .5rem 0'}"
        :bodyStyle="{padding:'0px'}"
        style="width: 100%">
        <div class="statistic">
          <a-statistic title="Вышло/всего выдано" :value="sum(outQuantity(i))">
            <template #suffix>
              <span> / {{ i.length }}</span>
            </template>
          </a-statistic>
            <a-card size="small" title="С какого раза мастер вышел">
              <a-statistic
                v-for="(i,k) in outQuantity(i)"
                :key="k"
                :title="k < 2 ? 'с ' + (k + 1) + ' раза' : 'более чем со 2-го раза'"
                :value="i"
                style="width: 200px; display: inline-block; text-align: center;"
              />
            </a-card>
        </div>
        <a-collapse :bordered="false">
          <a-collapse-panel :header="'подробный отчёт'">
            <data-grid :dataTable="i" :fields="{ind:fields, sub:subfields}" :summary="summary"/>
          </a-collapse-panel>
        </a-collapse>
      </a-card>
  </a-spin>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/ru_RU';
import DataGrid from '@/components/Table/Index.vue';
import { getTypeFormat } from '@/plugins/typeColumn';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  findIndex, forEach, groupBy, mapValues, merge, sum,
} from 'lodash';
import moment from 'moment';

/**
 * CONST
 */
const ID_LIST_DEFAULT = 68;
const COLUMN_HIDDEN_DEFAULT = ['PROPERTY_533', 'PROPERTY_548', 'PROPERTY_534', 'PROPERTY_547'];
const COLUMN_SUM_DEFAULT = {
  sum: ['COUNT_MASTERS'],
  count: ['TITLE'],
};

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
      table: {
        fields: {
          visible: COLUMN_HIDDEN_DEFAULT,
          summary: COLUMN_SUM_DEFAULT,
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
      getList: (state) => state.list.all.data,
      getDeal: (state) => state.deal.all.data,
    }),

    loadingData() {
      return sum([this.getListLoading, this.getDealLoading, this.getUserLoading]);
    },

    ...mapGetters({
      getListDataFilter: 'list/getListDataFilter',
      getFieldsList: 'list/getListFieldsType',

      getDealDataID: 'deal/getDealDataID',
      getDealFields: 'deal/getFields',

      getUser: 'user/getUser',
      filterUser: 'user/filterUser',

      getUserAuth: 'auth/getUser',
    }),

    fields() {
      return mapValues({
        HR_DISPATCH_NAME: { NAME: 'HR Диспетчер' },
        HR_DISPATCH_PERW: { NAME: 'Выдавший HR Диспетчер' },
        HR_DISPATCH_PERW_SUCC: { NAME: 'Выданный мастер вышел' },
        TITLE: { NAME: 'Заявка' },
        COUNT_MASTERS: { NAME: 'Мастеров выдано всего' },
        SUCCESS_MASTER: { NAME: 'С какого раза мастер вышел' },
      }, (i, k) => ({
        ...i,
        visible: !this.table.fields.visible.includes(k),
        // type: getTypeFormat(i.TYPE) === 'number' ? 'fixedPoint' : null,
        // dataType: getTypeFormat(i.TYPE),
      }));
    },

    subfields() {
      return mapValues({
        ...this.getFieldsList(this.block.master.id),
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
  },

  methods: {
    merge,
    groupBy,
    findIndex,
    sum,

    outQuantity(i) {
      const f = [0, 0, 0];
      i.forEach((iz) => {
        if (iz.SUCCESS_MASTER_SYS.length) {
          iz.SUCCESS_MASTER_SYS.forEach((ism) => {
            if (ism > 2) f[2] += 1;
            else f[ism] += 1;
          });
        }
      });
      return f;
    },

    ...mapActions({
      getUserData: 'user/get',

      getListData: 'list/get',
      getListFields: 'list/fields',

      getDealsData: 'deal/get',
      getDealsFields: 'deal/fields',
    }),

    gradeMasters(masters) {
      const t = [];
      if (masters) {
        masters.forEach((i, k) => {
          // eslint-disable-next-line eqeqeq,no-console,max-len
          if (i.PROPERTY_542 == 206 || i.PROPERTY_542 == 209 || i.PROPERTY_542 == 207) t.push(k);
        });
      }
      return t;
    },

    generateTableData(current) {
      const groupList = groupBy(Object.values(this.getList), 'PROPERTY_533');
      this.data = Object.values(this.getDeal).filter((i) => moment(i.DATE_CREATE).isBetween(moment(current).startOf('month'), moment(current).endOf('month'), null, '()'))
        .map((i) => ({
          ...i,
          // eslint-disable-next-line max-len
          masterDetail: groupList[i.ID] ? groupList[i.ID].filter((i2) => i2.PROPERTY_536 === i.UF_CRM_1600688263).map((i2) => this.getFormatDataFields(i2, this.getFieldsList(this.block.master.id))) : null,
          COUNT_MASTERS: groupList[i.ID] ? groupList[i.ID].length : 0,
          // eslint-disable-next-line max-len
          HR_DISPATCH_NAME: this.getUser(i.UF_CRM_1600688263) ? this.getUser(i.UF_CRM_1600688263).NAME : null,
          // HR_DISPATCH: this.getUser(i.UF_CRM_1600688263),
          // eslint-disable-next-line max-len
          HR_DISPATCH_PERW: groupList[i.ID] ? this.getUser(groupList[i.ID][0].PROPERTY_536).NAME : null,
          // eslint-disable-next-line max-len
          HR_DISPATCH_PERW_SUCC: this.gradeMasters(groupList[i.ID]).length ? this.getUser(groupList[i.ID][this.gradeMasters(groupList[i.ID])[0]].PROPERTY_536).NAME : null,
          SUCCESS_MASTER: this.gradeMasters(groupList[i.ID]).length ? this.gradeMasters(groupList[i.ID].filter((i2) => i2.PROPERTY_536 === i.UF_CRM_1600688263)).map((iz) => iz + 1).toString() : 'Не вышел',
          SUCCESS_MASTER_SYS: this.gradeMasters(groupList[i.ID]),
        }));
      console.log(this.data);
    },

    disabledDate(current) {
      return current && current > moment();
    },

    getFormatDataFields(data, fields) {
      return mapValues(data, (i, k) => {
        switch (fields[k] ? fields[k].TYPE : false) {
          case 'S:Date': {
            return moment(i, 'DD.MM.YYYY');
          } case 'date': {
            return moment(i);
          } case 'datetime': {
            return moment(i);
          } case 'S:ECrm': {
            return this.getDealDataID(i) ? this.getDealDataID(i).TITLE : `Не найдено [${i}]`;
          } case 'S:HTML': {
            return i.TEXT || null;
          } case 'S:employee': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.getUser(i) ? this.getUser(i).NAME : null : null;
          } case 'employee': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.getUser(i) ? this.getUser(i).NAME : null : null;
          } case 'user': {
            // eslint-disable-next-line no-nested-ternary
            return i > 0 ? this.getUser(i) ? this.getUser(i).NAME : null : null;
          } case 'L': {
            return fields[k].DISPLAY_VALUES_FORM[i];
          } default:
            break;
        }
        return i;
      });
    },

    async getData(current) {
      await this.getDealsData({
        filter: {
          CATEGORY_ID: 3,
          STAGE_ID: ['C3:9', 'C3:NEW', 'C3:5', 'C3:7', 'C3:8', 'C3:9', 'C3:11', 'C3:WON'],
          '>=DATE_CREATE': moment(current).startOf('month').format('DD.MM.YYYY HH:mm:ss'),
          '<=DATE_CREATE': moment(current).endOf('month').format('DD.MM.YYYY HH:mm:ss'),
        },
        select: ['ID', 'TITLE', 'UF_CRM_1568623837', 'UF_CRM_1568623890', 'DATE_CREATE', 'UF_CRM_1600688263'],
        key: 'ID',
      });
      await this.getListData({
        IBLOCK_TYPE_ID: 'lists',
        IBLOCK_ID: 68,
        FILTER: {
          /**
           *  Нужно будет добавить филтры, когда станет яснее приложение.
           * /
           /* '>=PROPERTY_117': moment(current).startOf('month').format('DD.MM.YYYY HH:mm:ss'),
           '<=PROPERTY_117': moment(current).endOf('month').format('DD.MM.YYYY HH:mm:ss'), */
        },
        key: 'ID',
      });
      this.generateTableData(current);
    },

    getUsers() {
      this.getUserData({
        select: ['ID', 'NAME', 'UF_DEPARTMENT', 'WORK_POSITION'],
        key: 'ID',
      });
    },

  },

  mounted() {
    this.getUsers();
    this.getListFields({
      IBLOCK_TYPE_ID: 'lists',
      IBLOCK_ID: 68,
      key: 'ID',
    });
  },

  watch: {
    month: {
      handler() {
        this.getData(this.month);
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
