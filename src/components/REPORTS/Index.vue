<template>
  <a-spin :spinning="loadingLead > 0" tip="Загружаю самые свежие данные...">


      <div style="margin: 1rem">
        <a-month-picker :size="size" v-model="month" @change="getLead(month)" placeholder="Выбрать месяц"/>

        <a-button-group style="float: right">

          <a-button :type="!fullXLS.length?'dashed':'primary'" :disabled="!fullXLS.length">
            <export-excel
                :data   = "fullXLS"
                :fields = "{'Диспетчер': 'name','ID Целевой': 'idCell','ID Замер': 'idZamer'}"
                worksheet = "Подробные данные"
                name    = "Сводная таблица"/>
          </a-button>

          <a-button :type="!dataArray.length?'dashed':'primary'" :disabled="!dataArray.length">
            <export-excel
                :data   = "dataArray"
                :fields = "{'Диспетчер': 'name','Целевых': 'cell','Замеров': 'zamer','Конверсия':'conversion','Ставка':'stavka','Зарплата':'zarplata'}"
                worksheet = "Подробные данные"
                name    = "Выгрузка.xls"/>
          </a-button>

        </a-button-group>

      </div>

      <a-table
          :pagination="false"
          :columns="columns"
          :data-source="dataArray"/>

    <a-row style="margin: 1rem" v-if="dataTotal.conversion">
      <a-col :span="4">
        <a-progress style="margin: 1rem" :strokeColor="dataTotal.conversion < 50?'yellow':'green'" type="circle" :percent="dataTotal.conversion" />
      </a-col>
      <a-col :span="20">
        <a-statistic title="Целевых" :value="dataTotal.cell"/>
        <a-statistic title="Замеров всего" :value="dataTotal.zamer" />
      </a-col>
    </a-row>

  </a-spin>
</template>

<script>

import {mapActions, mapState} from 'vuex';
import moment from 'moment';
import { forEach, values } from 'lodash'


export default {

  data() {
    return {

      columns: [{
          title: 'Имя',
          dataIndex: 'name',
        }, {
          title: 'Целевых',
          dataIndex: 'cell',
        }, {
          title: 'Замеров',
          dataIndex: 'zamer',
        },{
          title: 'Конверсия',
          dataIndex: 'conversion',
        }, {
          title: 'Ставка',
          dataIndex: 'stavka',
        },{
          title: 'Зарплата',
          dataIndex: 'zarplata',
        }],
      month: moment(),

    }
  },

  computed:{

    dataTotal(){
      let a = {
        cell: 0, uncell: 0,
        zamer: 0, stavka: 0,
        conversion: 0, zarplata: 0,
      }
      forEach(this.listLead, (i) => {
        if (moment(i.DATE_CREATE).isSame(this.month, 'month')){
          a.cell += Number(i.UF_CRM_1581944554)
          a.uncell += Number(i.UF_CRM_1581945318)
        }
        if (moment(i.UF_CRM_1597071883).isSame(this.month, 'month')){
          a.zamer += Number(i.UF_CRM_1571890819)
        }
      })

      if ( a.zamer>1 && a.cell>1 ) {
        a.conversion = ((a.zamer/a.cell)*100).toFixed(2)
        a.stavka = a.conversion < 30 ? 150: a.conversion < 35 ? 200: a.conversion < 40 ? 250: a.conversion < 45 ? 300: a.conversion < 50 ? 350:375;
        a.zarplata = a.zamer*a.stavka
      }
      return a
    },


    fullXLS(){
      let a = []
      forEach(this.listLead, (i) => {
        if (moment(i.DATE_CREATE).isSame(this.month, 'month') && Number(i.UF_CRM_1581944554)){
          a.push({
            name: this.listUser[i.UF_CRM_1582724265]?this.listUser[i.UF_CRM_1582724265].NAME : 'Имя не найдено',
            idCell: i.TITLE,
          })
        }
        if (moment(i.UF_CRM_1597071883).isSame(this.month, 'month') && Number(i.UF_CRM_1571890819)) {
          a.push({
            name: this.listUser[i.UF_CRM_1582724265]?this.listUser[i.UF_CRM_1582724265].NAME : 'Имя не найдено',
            idZamer: i.TITLE,
          })
        }
      })
      return a
    },

    dataArray(){
      let a = {}
      forEach(this.listLead, (i) => {
        if (!a[i.UF_CRM_1582724265]){
          a[i.UF_CRM_1582724265] = {
            cell: 0, uncell: 0,
            zamer: 0, stavka: 0,
            conversion: 0, zarplata: 0,
            name: this.listUser[i.UF_CRM_1582724265]?this.listUser[i.UF_CRM_1582724265].NAME : 0
          }
        }//Создание структуры
        if (moment(i.DATE_CREATE).isSame(this.month, 'month')){
          a[i.UF_CRM_1582724265].cell += Number(i.UF_CRM_1581944554)
          a[i.UF_CRM_1582724265].uncell += Number(i.UF_CRM_1581945318)
        }
        if (moment(i.UF_CRM_1597071883).isSame(this.month, 'month')){
          a[i.UF_CRM_1582724265].zamer += Number(i.UF_CRM_1571890819)
        }
      })

      forEach(a, (i) => {
        if ( i.zamer>1 && i.cell>1 ) {
          i.conversion = ((i.zamer/i.cell)*100).toFixed(2)
          i.stavka = i.conversion < 30 ? 150: i.conversion < 35 ? 200: i.conversion < 40 ? 250: i.conversion < 45 ? 300: i.conversion < 50 ? 350:375;
          i.zarplata = i.zamer*i.stavka
        }
      })
      return values(a)
    },



    ...mapState({
        listLead: state => state.crm.lead.data,
        loadingLead: state => state.crm.lead.loading,
        listUser: state => state.crm.user.data,
    }),

  },

  methods: {

    ...mapActions({

      getLeadSync: 'crm/getLeadSync',
      getUserSync: 'crm/getUserSync',

    }),


    async getLead(month) {
      this.json_data = []

      await this.getLeadSync({
        filter: {
              'UF_CRM_1581944554':1,
              ">=DATE_CREATE": moment(month).startOf('month').format('DD.MM.YYYY 00:00:00'),//Фитруем по выбранным датам
              "<=DATE_CREATE": moment(month).endOf('month').format('DD.MM.YYYY 23:59:59'),//Фильтруем по выбранным датам
            },
        select: [
          'ID','TITLE',
          'UF_CRM_1581944554', //Целевой
          'UF_CRM_1581945318', //Замер не учитан (не целевой)
          'UF_CRM_1582724265', //Диспетчер
          'UF_CRM_1597071883', //Дата замера
          'UF_CRM_1571890819', //Замер состоялся
          'DATE_CREATE', //Дата создания
        ]
      })
      console.log('Выполнение 2')
      await this.getLeadSync({
        filter: {
          'UF_CRM_1571890819':1,
          ">=UF_CRM_1597071883": moment(month).startOf('month').format('DD.MM.YYYY 00:00:00'),//Фитруем по выбранным датам
          "<=UF_CRM_1597071883": moment(month).endOf('month').format('DD.MM.YYYY 23:59:59'),//Фильтруем по выбранным датам
        },
        select: [
          'ID','TITLE',
          'UF_CRM_1581944554', //Целевой
          'UF_CRM_1581945318', //Замер не учитан (не целевой)
          'UF_CRM_1582724265', //Диспетчер
          'UF_CRM_1597071883', //Дата замера
          'UF_CRM_1571890819', //Замер состоялся
          'DATE_CREATE', //Дата создания
        ]
      })
    },

    getUsers(){
      this.getUserSync({
        filter: {},
        sort:{},
        select: ['ID', 'NAME', 'UF_DEPARTMENT', 'WORK_POSITION'],
        order:{},
        key:'ID',
      })
    },


  },
  mounted(){
    //this.getPermission();
    this.getUsers();
  }
}
</script>