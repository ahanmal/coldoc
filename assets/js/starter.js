import "../../node_modules/jquery/dist/jquery.js"
import "../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "../../node_modules/bootstrap-table/dist/bootstrap-table.min.js";
import "../../node_modules/marked/lib/marked.js"
import "../../node_modules/bootstrap-table/dist/extensions/multiple-sort/bootstrap-table-multiple-sort.js"


// Utility Functions
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function detailFormatter(index, row) {
    return `${row.description} <button type="button" class="btn btn-success float-right accept-btn">Accept</button>`;
}

// Trial Logic

window.addEventListener('load', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    let trial = urlParams.get('trial');
    if (!trial) {
        $('#trial-start').remove();
        document.body.onkeypress = null;
        return;
    }

    let searchType = trial.substring(0, 1);
    let test = trial.substring(1, 2);

    window.search = searchType == 'a' ? true : false;

    switch (test) {
        case '1':
            window.correct_name = 'split';
            break;
        case '2':
            window.correct_name = 'map2';
            break;
        case '3':
            window.correct_name = 'mem';
            break;
    }
});

document.body.onkeypress = function (e) {
    if (e.keyCode == 32) {
        $('#trial-start').remove();
        document.body.onkeypress = null;
        window.startTime = (new Date()).getTime();
        window.misses = 0;
        window.inspected = 0;
        return false;
    }
};

$('#table').on('expand-row.bs.table', function (index, row, detail) {
    window.inspected += 1;
    $(".accept-btn").click(function (e) {
        let name = detail.name.replace('<code>', '').replace('</code>', '');
        if (name == window.correct_name) {
            let endTime = (new Date()).getTime();
            let diff = endTime - window.startTime;
            let elapsedSeconds = diff / 1000.0;
            alert(`Elapsed: ${elapsedSeconds} s\nMisses: ${window.misses}\nInspects: ${window.inspected}`);
        } else {
            $(e.target).text('Try Again');
            $(e.target).attr('disabled', true);
            $(e.target).removeClass('btn-success');
            $(e.target).addClass('btn-danger');
            window.misses += 1;
        }

    });
});

// Table Logic

var $table = $('#table');

let argumentSortPriority = [
    {
        "sortName": "arg_a",
        "sortOrder": "asc"
    },
    {
        "sortName": "arg_b",
        "sortOrder": "asc"
    },
    {
        "sortName": "arg_c",
        "sortOrder": "asc"
    },
    {
        "sortName": "arg_d",
        "sortOrder": "asc"
    }
];

function buttons() {
    return {
        btnArgSort: {
            text: 'Sort By Arguments',
            event: function () {
                $table.bootstrapTable('multiSort', argumentSortPriority);
                $table.bootstrapTable('multipleSort');

            },
            attributes: {
                title: 'Sort By Arguments'
            }
        },
        btnUsageSort: {
            text: 'Sort By Usage',
            event: function () {
                $table.bootstrapTable('multiSort', [
                    {
                        "sortName": "gh_count",
                        "sortOrder": "desc"
                    }
                ]);
                $table.bootstrapTable('multipleSort');
            },
            attributes: {
                title: 'Sort By Usage'
            }
        },
        btnTagSort: {
            text: 'Sort By Tags',
            event: function () {
                $table.bootstrapTable('multiSort', [
                    {
                        "sortName": "tags",
                        "sortOrder": "desc"
                    }
                ]);
                $table.bootstrapTable('multipleSort');
            },
            attributes: {
                title: 'Sort By Tags'
            }
        },
        btnToggleDescs: {
            text: 'Show Usage Descriptions',
            event: function () {
                $table.bootstrapTable('getData').forEach( (el, index) => {
                    $table.bootstrapTable('toggleDetailView', index);
                });
                let $btn = $("button[name='btnToggleDescs']");
                $btn.html($btn.html().includes('Show') ? "Hide Usage Descriptions" : "Show Usage Descriptions");
            },
            attributes: {
                title: 'Show Usage Descriptions'
            }
        },
    };
}

$.getJSON("/list.json", data => {

    data.functions.map(el => {
        let backgroundRGB = hexToRgb(data.categories[el.tags]);
        let textColor = ((backgroundRGB.r * 0.299 + backgroundRGB.g * 0.587 + backgroundRGB.b * 0.114) > 186) ? "black" : "white";

        el.tags = `<span class="badge bg-primary" style="color: ${textColor}; background-color: ${data.categories[el.tags]} !important">${el.tags}</span>`
        el.name = `<code>${el.name}</code>`;
        el.arg_a = `<code>${el.arg_a == "" ? " " : el.arg_a}</code>`;
        el.arg_b = `<code>${el.arg_b == "" ? " " : el.arg_b}</code>`;
        el.arg_c = `<code>${el.arg_c == "" ? " " : el.arg_c}</code>`;
        el.arg_d = `<code>${el.arg_d == "" ? " " : el.arg_d}</code>`;
        el.return = `<code>${el.return}</code>`;
    });

    $('#name').html(`Module <code>${data.module_name}</code>`);
    $('#top-text').html(data.top_html);

    $table.bootstrapTable({
        data: data.functions,
        classes: 'table table-bordered',
        icons: {"detailOpen": "fa-caret-right", "detailClose": "fa-caret-down", "fullscreen": "fa-arrows-alt"},
        buttonsAlign: 'left',
        detailView: true,
        detailViewByClick: true,
        detailFormatter: detailFormatter,
        search: window.search != null ? window.search : true,
        showMultiSort: true,
        multiSortStrictSort: true,
        sortPriority: argumentSortPriority,
        showButtonText: true,
        buttons: buttons
    });

    $('[title="Multiple Sort"]').html("Multiple Sort Editor");
    $('[title="Multiple Sort"]').removeClass("btn-secondary").addClass("btn-primary");
    $('[title="Multiple Sort"]').parent().prepend($('[title="Multiple Sort"]'));
    $('[title="Multiple Sort"]').parent().removeClass('btn-group');
    $('[title="Multiple Sort"]').parent().children().css('margin-right', '10px');

});








