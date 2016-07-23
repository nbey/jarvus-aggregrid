Ext.define('Jarvus.aggregrid.RollupAggregrid', {
    extend: 'Jarvus.aggregrid.Aggregrid',
    xtype: 'jarvus-rollupaggregrid',


    config: {
        subRowsStore: null,
        subDataStore: null,

        subRowMapper: 'parent_row_id',

        subRowHeaderField: 'title',
        subRowHeaderTpl: false,

        subCellTpl: '{records.length}',
        subCellRenderer: false,

        expandable: true,
        expanderHeadersTpl: [
            '<table class="jarvus-aggregrid-expander-table">',
                '<tbody>',
                    '<tpl for="rows">',
                        '<tr class="jarvus-aggregrid-subrow">',
                            '<th class="jarvus-aggregrid-rowheader">',
                                '<span class="jarvus-aggregrid-header-text">',
                                    '{% values.rowHeaderTpl.applyOut(values, out, parent) %}',
                                '</span>',
                            '</th>',
                        '</tr>',
                    '</tpl>',
                '</tbody>',
            '</table>'
        ],
        expanderBodyTpl: [
            '<table class="jarvus-aggregrid-expander-table">',
                '<tbody>',
                    '<tpl for="rows">',
                        '<tr class="jarvus-aggregrid-subrow">',
                            '<tpl for="columns">',
                                '<td class="jarvus-aggregrid-cell {cls}">{text}</td>',
                            '</tpl>',
                        '</tr>',
                    '</tpl>',
                '</tbody>',
            '</table>'
        ]
    },


    // config handlers
    applySubRowsStore: function(store) {
        return Ext.StoreMgr.lookup(store);
    },

    // updateSubRowsStore: function(store, oldStore) {
    //     var me = this;

    //     if (oldStore) {
    //         oldStore.un('datachanged', 'refresh', me);
    //     }

    //     if (store) {
    //         me.refresh();
    //         store.on('datachanged', 'refresh', me);
    //     }
    // },

    applySubDataStore: function(store) {
        return Ext.StoreMgr.lookup(store);
    },

    // updateSubDataStore: function(store, oldStore) {
    //     var me = this,
    //         listeners = {
    //             scope: me,
    //             load: 'onDataStoreLoad',
    //             add: 'onDataStoreAdd',
    //             remove: 'onDataStoreRemove',
    //             update: 'onDataStoreUpdate'
    //         };

    //     if (oldStore) {
    //         oldStore.un(listeners);
    //     }

    //     if (store) {
    //         store.on(listeners);
    //     }
    // },

    applySubRowHeaderTpl: function(tpl) {
        if (!tpl) {
            tpl = new Ext.XTemplate(
                '{[typeof values === "string" ? values : values["' + this.getSubRowHeaderField() + '"]]}'
            );
        } else if (!tpl.isTemplate) {
            tpl = new Ext.XTemplate(tpl);
        }

        return tpl;
    },

    applySubRowMapper: function(mapper) {
        if (!Ext.isString(mapper)) {
            return mapper;
        }

        return function(subRowRecord, rowsStore) {
            return rowsStore.getById(subRowRecord.get(mapper));
        };
    },

    applySubCellTpl: function(tpl) {
        if (tpl && !tpl.isTemplate) {
            tpl = new Ext.XTemplate(tpl);
        }

        return tpl;
    },

    applyExpanderHeadersTpl: function(tpl) {
        if (tpl && !tpl.isTemplate) {
            tpl = new Ext.XTemplate(tpl);
        }

        return tpl;
    },

    applyExpanderBodyTpl: function(tpl) {
        if (tpl && !tpl.isTemplate) {
            tpl = new Ext.XTemplate(tpl);
        }

        return tpl;
    },


    // event handlers


    // component methods
    doRefresh: function(me) {
        var rowsSubRows = me.rowsSubRows = {},
            rowsStore = me.getRowsStore(),
            rowsCount = rowsStore.getCount(),
            rowIndex = 0, row, rowId;

        me.callParent(arguments);

        // initialize subrows data structure
        for (; rowIndex < rowsCount; rowIndex++) {
            row = rowsStore.getAt(rowIndex);
            rowId = row.getId();

            rowsSubRows[rowId] = {};
        }
    },

    doExpand: function(me, rowId) {
        var expanderTplData = me.buildExpanderTplData(rowId);

        me.getExpanderHeadersTpl().overwrite(me.rowHeaderExpanderEls[rowId], expanderTplData);
        me.getExpanderBodyTpl().overwrite(me.rowExpanderEls[rowId], expanderTplData);

        me.callParent(arguments);
    },

    buildExpanderTplData: function(rowId) {
        var me = this,
            subRowsData = me.rowsSubRows[rowId],
            subRowsRecords = subRowsData.records,
            rowHeaderTpl = me.getSubRowHeaderTpl() || me.getRowHeaderTpl(),
            // subRowsGroups = subRowsData.groups,

            columnsStore = me.getColumnsStore(),
            columnsCount = columnsStore.getCount(),

            rowsStore = me.getRowsStore(),
            subRowsStore = me.getSubRowsStore(),
            subRowMapper = me.getSubRowMapper(),
            subRowsCount = subRowsStore.getCount(),
            subRowIndex = 0, subRow, subRowParent,

            i,
            data = {},
            columns = data.columns = [],
            rows = data.rows = [];

        // collect and cache all subrow records that map to this row
        if (!subRowsRecords) {
            subRowsRecords = subRowsData.records = [];

            for (; subRowIndex < subRowsCount; subRowIndex++) {
                subRow = subRowsStore.getAt(subRowIndex);
                subRowParent = subRowMapper(subRow, rowsStore);

                if (subRowParent.getId() == rowId) {
                    subRowsRecords.push(subRow);
                }
            }
        }

        // generate columns and rows render data
        for (i = 0; i < columnsCount; i++) {
            columns.push(columnsStore.getAt(i).getData());
        }

        for (i = 0, subRowsCount = subRowsRecords.length; i < subRowsCount; i++) {
            rows.push(Ext.apply({
                rowHeaderTpl: rowHeaderTpl,
                columns: columns
            }, subRowsRecords[i].getData()));
        }

        return data;
    }
});