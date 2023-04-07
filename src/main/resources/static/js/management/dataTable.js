// 데이터테이블 컬럼정보 저장
function saveColumnInfo(tableId) {
    let table = $('#' + tableId).DataTable();
    let settings = table.settings()[0];
    let tableWidth = Number($('#' + tableId).width());

    let columnsInfo = [];
    for (let column of settings.aoColumns) {
        let columnInfo = {
            data: column.data,
            idx: column.idx,
            oriIdx: column._ColReorder_iOrigCol,
            width: Math.round((Number(column.nTh.offsetWidth) / tableWidth) * 100) + '%',
            visible: column.bVisible,
        };
        columnsInfo.push(columnInfo);
    }

    let saveInfo = {
        columnsInfo: columnsInfo,
        columnReorder: table.colReorder.order(),
        columnOrder: table.order()[0]
    };
    window.localStorage.setItem(window.location.pathname + '.' + tableId + '.tableinfo', JSON.stringify(saveInfo));

    alert('항목 정보를 저장하였습니다.');
}

// 데이터테이블 컬럼정보 초기화
function deleteColumnInfo(tableId) {
    let saveInfo = window.localStorage.getItem(window.location.pathname + '.' + tableId + '.tableinfo');
    if (saveInfo == null) {
        alert('초기화할 정보가 없습니다.');
    } else {
        window.localStorage.removeItem(window.location.pathname + '.' + tableId + '.tableinfo');
        alert('테이블 항목 정보를 초기화하였습니다.');
    }
}

// 데이터테이블 생성
function initializeDataTable(tableId, pageLength, scrollY, columns, data, footer, cbFooter, visibleButton, reorderable, resizeable, createRowFunc) {
    let dtColumns = columns;
    let dtColReorder;
    let dtOrder;

    let saveInfo = JSON.parse(window.localStorage.getItem(window.location.pathname + '.' + tableId + '.tableinfo'));
    if (saveInfo != null) {
        for (column of dtColumns) {
            let saveColumnInfo = saveInfo.columnsInfo.find(function(element) {
                return element.data == column.data;
            });

            if (saveColumnInfo != null) {
                column.width = saveColumnInfo.width;
                column.bVisible = saveColumnInfo.visible;
            }
        }
        dtColReorder = saveInfo.columnReorder;
        dtOrder = saveInfo.columnOrder;
    }

    // 툴팁 관련 컬럼 렌더러를 재정의한다.
    for (column of dtColumns) {
        if (column.render != null) {
            // 컬럼 렌더러가 정의되어 있다.
            let func = column.render;
            if (func instanceof Function) {
                // 컬럼 렌더러가 함수형태이다. 새로 렌더러를 정의한다.
                column.render = function(data, type, row, meta) {
                    // 기존 정의된 함수를 호출하여 데이터 문자열을 생성한다.
                    var dataStr = func(data, type, row, meta);
                    if (type == 'display' && valueIsEmpty(dataStr) == false) {
                        // 타입이 디스플레이이다. 데이터 문자열을 확인하여 툴팁을 추가한다.
                        if (dataStr.includes('>')) {
                            // 데이터 문자열에 태그가 존재한다. Title 속성을 추가한다.
                            dataStr = dataStr.replace('>', " title='" + data + "'>");
                        } else {
                            // 데이터 문자열에 태그가 존재하지 않는다. Span 태그 추가 후 Title 속성을 추가한다.
                            dataStr = "<span title='" + data + "'>" + dataStr + "</span>";
                        }
                    }
                    return dataStr;
                }
            } else if (func instanceof DataTable.render.constructor) {
                // 컬럼 렌더러가 데이터테이블에서 제공하는 렌더러이다. 새로 렌더러를 정의한다.
                column.render = function(data, type, row, meta) {
                    if (type == 'display' && valueIsEmpty(data) == false) {
                        // 타입이 디스플레이이다. 정의된 렌더러를 통해 문자열을 받아와 Title 속성을 추가한다.
                        return "<span title='" + data + "'>" + func.display(data) + "</span>";
                    }
                    return func.display(data);
                }
            } else {
                // 정의되지 않은 렌더러 형태이다. 아무런 작업하지 않는다.
                console.log('undefined column render: ' + func);
            }
        } else {
            // 컬럼 렌더러가 정의되어 있지 않다. 새로 렌더러를 정의한다.
            column.render = function(data, type, row, meta) {
                if (type == 'display' && valueIsEmpty(data) == false) {
                    return '<span title="' + data + '">' + data + '</span>';
                }
                return data;
            }
        }
    }

    if ($.fn.dataTable.isDataTable('#' + tableId) === false) {
        // 데이터테이블이 생성되지 않았을 경우 최초 생성 시 컬럼 width 총합이 테이블 width에 못미칠경우 100%로 나오지 않음...
        // 임시로 사전에 데이터테이블을 생성하여 초기화 후 진행하여 조치...
        $('#' + tableId).DataTable({
            destory: true,
            stateSave: false,
            autoWidth: false,
            paging: false,
            searching: false,
            info: false,
            lengthChange: false,
            pageLength: pageLength,
            language: {
                emptyTable: '데이터가 없습니다.'
            },
            dom: 'Rlfrtip',
            colReorder: {
                allowReorder: (reorderable == null || false) ? true : reorderable,
                allowResize: (resizeable == null || false) ? true : resizeable,
            },
            data: [],
            order: [],
            columns: columns,
            columnDefs: [
                {
                    targets: '_all',
                    className: 'txt-center'
                }
            ],
        });
    }

    // 테이블을 초기화한다.
    $('#' + tableId + ' > thead').empty();
    $('#' + tableId + ' > tbody').empty();
    $('#' + tableId + ' > tfoot').empty();

    $('#' + tableId).empty();

    $('#' + tableId).DataTable().destroy();

    if (cbFooter != null) {
        if ($('#' + tableId + ' > tfoot').length <= 0) {
            $('#' + tableId).append('<tfoot></tfoot>');
        }
        $('#' + tableId + ' > tfoot').append(footer);
    }
    let cFunc;
    if (createRowFunc != null) {
        cFunc = createRowFunc;
    }

    // 스크롤 설정에 따라 분기 처리한다. (스크롤 옵션 넣을 시 컬럼 리사이즈 동작 오류)
    if (scrollY == null || scrollY === 0) {
        $('#' + tableId).DataTable({
            destory: true,
            stateSave: false,
            autoWidth: false,
            paging: false,
            searching: false,
            info: false,
            lengthChange: false,
            pageLength: pageLength,
            language: {
                emptyTable: '데이터가 없습니다.'
            },
            dom: 'Rlfrtip',
            colReorder: {
                allowReorder: (reorderable == null || false) ? true : reorderable,
                allowResize: (resizeable == null || false) ? true : resizeable,
            },
            data: data,
            order: [],
            columns: columns,
            columnDefs: [
                {
                    targets: '_all',
                    className: 'txt-center'
                }
            ],
            footerCallback: cbFooter,
            createdRow: cFunc,
            initComplete: function(_settings, _json) {
                $("#" + tableId).wrap("<div style='overflow:auto; width:100%; position:relative;'></div>");

                if (dtColReorder != null) {
                    $('#' + tableId).DataTable().colReorder.order(dtColReorder);
                }
                if (dtOrder != null) {
                    $('#' + tableId).DataTable().order(dtOrder).draw();
                }
            },
            drawCallback: function() {
                if (cbFooter == null) {
                    let table = this.api();

                    let colCount = table.columns(':visible').count();
                    let rowCount = table.rows({page: 'current'}).count();
                    let pageLength = table.page.len();

                    for (let index = 0; index < pageLength - (rowCount === 0 ? 1 : rowCount); index++) {
                        if (index === 0) {
                            if (rowCount === 0)
                                $('#' + tableId).append($("<tr class='dummyRow'><td colspan='" + colCount + "' class='dummyCol'>&nbsp;</td></tr>"));
                            else
                                $('#' + tableId).append($("<tr class='dummyRow'><td colspan='" + colCount + "' class='firstRow dummyCol'>&nbsp;</td></tr>"));
                        } else if (index === pageLength - (rowCount === 0 ? 1 : rowCount) - 1) {
                            $('#' + tableId).append($("<tr class='dummyRow'><td colspan='" + colCount + "' class='dummyCol'>&nbsp;</td></tr>"));
                        } else {
                            $('#' + tableId).append($("<tr class='dummyRow'><td colspan='" + colCount + "' class='dummyCol'>&nbsp;</td></tr>"));
                        }
                    }
                }
            }
        });
    } else {
        $('#' + tableId).DataTable({
            destory: true,
            stateSave: false,
            autoWidth: false,
            paging: false,
            searching: false,
            info: false,
            lengthChange: false,
            pageLength: pageLength,
            scrollY: scrollY,
            scrollCollapse: true,
            deferRender: true,
            responsive: true,
            language: {
                emptyTable: '데이터가 없습니다.'
            },
            dom: 'Rlfrtip',
            colReorder: {
                allowReorder: (reorderable == null || false) ? true : reorderable,
                allowResize: (resizeable == null || false) ? true : resizeable,
            },
            data: data,
            order: [],
            columns: columns,
            columnDefs: [
                {
                    targets: '_all',
                    className: 'txt-center'
                }
            ],
            footerCallback: cbFooter,
            createdRow: cFunc,
            initComplete: function(_settings, _json) {
                $("#" + tableId).wrap("<div style='overflow:auto; width:100%; position:relative;'></div>");

                if (dtColReorder != null) {
                    $('#' + tableId).DataTable().colReorder.order(dtColReorder);
                }
                if (dtOrder != null) {
                    $('#' + tableId).DataTable().order(dtOrder).draw();
                }
            },
            drawCallback: function() {
                if (cbFooter == null) {
                    let table = this.api();

                    let colCount = table.columns(':visible').count();
                    let rowCount = table.rows({page: 'current'}).count();
                    let pageLength = table.page.len();

                    for (let index = 0; index < pageLength - (rowCount === 0 ? 1 : rowCount); index++) {
                        if (index === 0) {
                            if (rowCount === 0)
                                $('#' + tableId).append($("<tr class='dummyRow'><td colspan='" + colCount + "' class='dummyCol'>&nbsp;</td></tr>"));
                            else
                                $('#' + tableId).append($("<tr class='dummyRow'><td colspan='" + colCount + "' class='firstRow dummyCol'>&nbsp;</td></tr>"));
                        } else if (index === pageLength - (rowCount === 0 ? 1 : rowCount) - 1) {
                            $('#' + tableId).append($("<tr class='dummyRow'><td colspan='" + colCount + "' class='dummyCol'>&nbsp;</td></tr>"));
                        } else {
                            $('#' + tableId).append($("<tr class='dummyRow'><td colspan='" + colCount + "' class='dummyCol'>&nbsp;</td></tr>"));
                        }
                    }
                }
            }
        });
    }

    if (visibleButton != null) {
        if ($("#" + visibleButton).closest('div').attr('class') === "dropdown") {
            $("dropdown").empty();
            $("dropdown").remove();

            $("#" + visibleButton).unwrap();
        }

        $("#" + visibleButton).wrap("<div class='dropdown' id='dropdown'></div>");
        $("#dropdown").append("<div class='dropdown-content' id='dropdownContents'></div>")

        for (column of dtColumns) {
            $("#dropdownContents").last().append("<label><input id=" + column.data + " type='checkbox'>" + column.title + "</label>");
            $("#dropdownContents #" + column.data).prop('checked', ((column.bVisible == null || false) ? true : column.bVisible));
        }

        $("#dropdownContents input[type=checkbox]").on("change", function(e) {
            changeColumnVisible(tableId, e.target.id, 'dropdownContents');
        });
    }
}