<template>
  <dx-data-grid
    :dataSource="dataTable"
    :allow-column-resizing="true"
    column-resizing-mode="nextColumn"
    :allow-column-reordering="true"
    :column-auto-width="true"
  >
    <dxColumn typeBase
      v-for="(i, k) in fields.ind"
      :key="k"
      :caption="i.NAME || i.listLabel || i.title"
      :dataField="k"
      :visible="i.visible"
      :format="i.type"
      :dataType="i.dataType"
    />
    <DxExport :enabled="true" :allow-export-selected-data="false"/>
    <DxColumnFixing :enabled="true"/>
    <DxHeaderFilter :visible="true"/>
    <dxFilterRow  :visible="true" />
    <dxGroupPanel :visible="true" />
    <DxColumnChooser :enabled="true"/>
    <dxGrouping :autoExpandAll="false" />
    <dxPaging :pageSize="20" />
    <dxColumn
    />
    <dxColumn/>
    <DxSummary>
      <DxTotalItem
        v-for="i in summary"
        :key="i.column+'t'"
        :column="i.column"
        :value-format="i.valueFormat"
        :summary-type="i.summaryType"
      />
      <DxGroupItem
        v-for="i in summary"
        :show-in-group-footer="i.showInGroupFooter"
        :align-by-column="i.alignByColumn"
        :key="i.column+'g'"
        :column="i.column"
        :value-format="i.valueFormat"
        :summary-type="i.summaryType"
      />
    </DxSummary>
    <DxPager
      :allowed-page-sizes="[10, 25, 50, 100]"
      :show-page-size-selector="true"
    />
  </dx-data-grid>
</template>

<script>

import {
  DxDataGrid,
  DxGroupPanel,
  DxGrouping,
  DxPaging,
  DxFilterRow,
  DxPager,
  DxColumn,
  DxExport,
  DxColumnChooser,
  DxHeaderFilter,
  DxSummary,
  DxTotalItem,
  DxGroupItem,
  DxColumnFixing,
} from 'devextreme-vue/data-grid';
import ruMessages from 'devextreme/localization/messages/ru.json';
import { locale, loadMessages } from 'devextreme/localization';

export default {
  props: ['dataTable', 'fields', 'summary'],
  components: {

    DxDataGrid,
    DxGroupPanel,
    DxGrouping,
    DxPaging,
    DxFilterRow,
    DxPager,
    DxColumn,
    DxExport,
    DxColumnChooser,
    DxHeaderFilter,
    DxSummary,
    DxTotalItem,
    DxGroupItem,
    DxColumnFixing,
  },
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {
  },
  created() {
    loadMessages(ruMessages);
    locale(navigator.language);
  },
  mounted() {
  },
};
</script>

<style scoped>

</style>
