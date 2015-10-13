// custom.js

jQuery(document).ready(function($) {

    // =============== plugins config ===============

    // jQuery validate
    if ($.validator) {
        $.validator.addMethod(
            "regex",
            function(value, element, regexp) {
                if (regexp.constructor != RegExp)
                    regexp = new RegExp(regexp);
                else if (regexp.global)
                    regexp.lastIndex = 0;
                return this.optional(element) || regexp.test(value);
            },
            "Please check your input."
        );

        $.validator.addMethod('mobile', function (value, element) {
            var length = value.length;
            var mobile = /^((1[3-8][0-9])+\d{8})$/;
            return this.optional(element) || (length == 11 && mobile.test(value));
        });

        $.validator.addMethod('tel', function (value, element) {
            var tel = /^\d{3,4}-?\d{7,9}$/;    //电话号码格式010-12345678
            return this.optional(element) || (tel.test(value));
        });
    }

    // Dropzone
    var $imgUpload = $('#img-upload.dropzone');
    if ($imgUpload.length > 0) {

        $imgUpload.dropzone({
            url: '/vendor/item_image',
            method: 'put',
            acceptedFiles: 'image/jpg, image/jpeg, image/png',
            addRemoveLinks: getPageTitle() !== 'item-edit',
            dictDefaultMessage: '拖动文件到此以上传',
            dictResponseError: '服务器错误, 上传失败, 请稍后重试。',
            dictCancelUpload: '取消上传',
            dictCancelUploadConfirmation: '确定取消上传吗？',
            dictRemoveFile: '移除文件',

            init: function () {
                this
                    .on('removedfile', function (file) {
                        console.log(file.previewElement);
                        var hash = $(file.previewElement).data('hash');

                        if (hash) deleteImage(hash);
                    })
                    .on('success', function (file, data) {
                        $(file.previewElement).data('hash', data.hash);

                        var $album = $('.album-images');
                        if ($album.length > 0) {
                            $album.append($(genImageView({
                                name: file.name,
                                hash: data.hash,
                                url: data.url,
                                created: data.created
                            })));
                        }
                    });
            }
        });
    }


    // Datatable
    function initDatatable($el, opt) {
        $el.dataTable({
            aLengthMenu: [
                [10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]
            ],
            language: {
                "sProcessing":   "处理中...",
                "sLengthMenu":   "显示 _MENU_ 项结果",
                "sZeroRecords":  "没有匹配结果",
                "sInfo":         "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
                "sInfoEmpty":    "显示第 0 至 0 项结果，共 0 项",
                "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
                "sInfoPostFix":  "",
                "sSearch":       "搜索:",
                "sUrl":          "",
                "sEmptyTable":     "表中数据为空",
                "sLoadingRecords": "载入中...",
                "sInfoThousands":  ",",
                "oPaginate": {
                    "sFirst":    "首页",
                    "sPrevious": "上页",
                    "sNext":     "下页",
                    "sLast":     "末页"
                },
                "oAria": {
                    "sSortAscending":  ": 以升序排列此列",
                    "sSortDescending": ": 以降序排列此列"
                }
            },
            processing: true,
            serverSide: true,
            ajax: opt.ajax,
            columns: opt.columns,
            columnDefs: opt.columnDefs,
        });
    }


    // =========== page init ==================

    // Items page
    if (getPageTitle() === 'items') {
        initDatatable($('#items'), {
            ajax: "/privilege/items/datatable",
            columns: [
                {data: "id", bSortable: false, visible: false},
                {data: "item", bSortable: false},
                {data: "vendor", bSortable: false},
                {data: "second_scene_id", bSortable: false},
                {data: "price"},
                {data: "size", bSortable: false}
            ],
            columnDefs: [{
                targets: [6],
                data: "id",
                render: function (id) {
                    return "<a href='/privilege/items/" + id + "'>详情</a>";
                }
            }]
        });
    }


    // Item Detail page
    if (getPageTitle() === 'item-detail') {

        // Set form disabled
        setFormDisabled($('#edit-item-form'));

        // Item Album page
        var $albumImages = $('.album-images');

        $albumImages
            // 修改大图弹窗中图片的 src
            .delegate('.album-image', 'click', function () {
                var src = $(this).find('.thumb img').attr('src');
                $('#gallery-image-modal')
                    .find('img').attr('src', src);
            });

    }


    // Distributors page
    if (getPageTitle() === 'distributors') {
        initDatatable($('#distributors'), {
            ajax: "/privilege/distributors/datatable",
            columns: [
                {data: "id", bSortable: false, visible: false},
                {data: "name", bSortable: false},
                {data: "address", bSortable: false},
                {data: "contact_telephone", bSortable: false},
                {data: "contact_mobile", bSortable: false},
                {data: "contact", bSortable: false},
                {data: "created", bSortable: false}
            ],
        });
    }


    // Vendors page
    if (getPageTitle() === 'vendors') {
        initDatatable($('#vendors'), {
            ajax: "/privilege/vendors/datatable",
            columns: [
                {data: "id", bSortable: false, visible: false},
                {data: "name", bSortable: false},
                {data: "address", bSortable: false},
                {data: "license_limit", bSortable: false},
                {data: "mobile", bSortable: false},
                {data: "telephone", bSortable: false},
            ],
            columnDefs: [{
                targets: [6],
                data: "id",
                render: function (id) {
                    return "<a href='/privilege/vendors/" + id + "'>详情</a>";
                }
            }]
        });
    }


    // Vendor detail page
    if (getPageTitle() === 'vendor-detail') {
        // Set form disabled
        setFormDisabled($('#vendor-detail-form'));

        $('#logo').on('change', function () {
            var $this = $(this);
            var files = !!this.files ? this.files : [];

            if (files.length <= 0 || !window.FileReader) return;

            if (/^image/.test(files[0].type)) {
                var reader = new FileReader();
                reader.readAsDataURL(files[0]);
                reader.onloadend = function () {
                    $this.siblings('.logo-preview')
                        .find('img')
                        .attr('src', this.result);
                };
            }
        });

    }


    // Vendor confirm page
    if (getPageTitle() === 'vendor-confirm') {
        var confirm = {
            vId: null,
            dId: null,
            confirmedVendor: {},
            confirmedDist: {},
            setVid : function (id) {
                this.vId = id;
                this.dId = null;
            },
            setDid: function (id) {
                this.dId = id;
                this.vId = null;
            },
            setCurrentIdConfirmed: function () {
                if (this.vId) {
                    this.confirmedVendor[this.vId] = true;
                }
                else if (this.dId) {
                    this.confirmedDist[this.dId] = true;
                }
            },
            unsetConfirmed: function (role, id) {
                if (role === 'vendor') {
                    console.log('vendor unset');
                    this.confirmedVendor[id] = false;
                }
                else if (role === 'distributor') {
                    console.log('dist unset');
                    this.confirmedDist[id] = false;
                }
            },
            isConfirmed: function () {
                if (this.vId && this.confirmedVendor[this.vId] ||
                        this.dId && this.confirmedDist[this.dId]) {
                    return true;
                }
                else return false;
            }
        };

        initDatatable($('#vendors'), {
            ajax: "/privilege/vendors/confirm/datatable",
            columns: [
                // visible data
                {data: "id", visible: false},
                {data: "email", visible: false},
                {data: "mobile", visible: false},
                {data: "telephone", visible: false},
                {data: "agent_name", visible: false},
                {data: "agent_identity", visible: false},
                {data: "agent_identity_front", visible: false},
                {data: "agent_identity_back", visible: false},

                {data: "name", bSortable: false},
                {data: "address", bSortable: false},
                {data: "license_limit", bSortable: false},
                {data: "telephone", bSortable: false},
            ],
            columnDefs: [
                {
                    targets: [12],
                    render: function () {
                        return '<span class="state">未审核</span>';
                    }
                },
                {
                    targets: [13],
                    data: {},
                    render: function (data) {
                        return '<a class="vendor-op" href="javascript:void(0);" ' + genDataAttrStr(data) + 'data-state="未审核" data-toggle="modal" data-target="#confirm-modal">详情/操作</a>';
                    }
                }
            ]
        });

        initDatatable($('#distributors'), {
            ajax: "/privilege/distributors/revocation/datatable",
            columns: [
                // visible data
                {data: "id", visible: false},
                {data: "contact_telephone", visible: false},
                {data: "contract", visible: false},

                {data: "name", bSortable: false},
                {data: "address", bSortable: false},
                {data: "contact_mobile", bSortable: false},
                {data: "contact", bSortable: false},
            ],
            columnDefs: [
                {
                    targets: [7],
                    render: function () {
                        return '<span class="state">未审核</span>';
                    }
                },
                {
                    targets: [8],
                    data: {},
                    render: function (data) {
                        return '<a class="dist-op" href="javascript:void(0);" ' + genDataAttrStr(data) + ' data-toggle="modal" data-target="#revocation-modal">详情/操作</a>';
                    }
                }
            ]
        });

        $('#vendors').delegate('.vendor-op', 'click', function () {
            var $buttons = $('#confirm-modal .modal-footer button[data-action]');
            var $this = $(this);

            // 改变 confirm 对象的 vendor id 为当前点击的项
            confirm.setVid($this.data('id'));
            // 重置 modal 窗里的详细内容
            setDlData($('#confirm-modal'), 'vendor', $this.data());

            // 如果当前项已审核则禁用弹窗中的按钮
            if (confirm.isConfirmed()) {
                $buttons.addClass('disabled');
            }
            else {
                $buttons.removeClass('disabled');
            }
        });
        $('#distributors').delegate('.dist-op', 'click', function () {
            var $buttons = $('#revocation-modal .modal-footer button[data-action]');
            var $this = $(this);

            // 改变 confirm 对象的 distributor id 为当前点击的项
            confirm.setDid($this.data('id'));
            // 重置 modal 窗里的详细内容
            setDlData($('#revocation-modal'), 'dist', $this.data());

            // 如果当前项已审核则禁用弹窗中的按钮
            if (confirm.isConfirmed()) {
                $buttons.addClass('disabled');
            }
            else {
                $buttons.removeClass('disabled');
            }
        });

        $('.modal-footer button[data-action]').click(function () {
            var $this = $(this);
            if ($this.hasClass('disabled')) return;

            var $opLink = null,    // 列表中打开modal窗的操作链接
                $stateTd = null,   // 列表中的状态列单元格
                role = null,
                id = null,
                url = null,
                data = null,
                stateValue = null;

            // 先判断是哪种审核，再根据不同的操作(接受或拒绝)做不同的处理
            if ($this.data('role') == 'vendor') {
                role = 'vendor';
                id = confirm.vId;
                $opLink = $('#vendors a[data-id="' + id + '"]');

                if ($this.data('action') == 'accept') {
                    url = '/privilege/vendor_confirm/pass';
                    stateValue = '已接受';
                }
                else {
                    url = '/privilege/vendor_confirm/reject';
                    stateValue = '已拒绝';
                }

                data = {vendor_id: id};
            }
            else if ($this.data('role') == 'distributor') {
                role = 'distributor';
                id = confirm.dId;
                $opLink = $('#distributors a[data-id="' + id + '"]');
                url = '/privilege/distributors/revocation';
                data = {distributor_revocation_id: id};

                if ($this.data('action') == 'accept') {
                    stateValue = '已同意';
                    data.revocation_confirm = true;
                }
                else {
                    stateValue = '已驳回';
                    data.revocation_confirm = false;
                }
            }

            $stateTd = $opLink.parents('tr').find('.state');
            $stateTd.removeClass('text-danger').text('处理中...');

            // 暂时将当前id项设为已审核，以防止在响应过程中重复提交请求
            confirm.setCurrentIdConfirmed();

            $.ajax({
                url: url,
                method: 'post',
                data: data,
                success: function (data) {
                    $stateTd
                        .removeClass('text-danger')
                        .addClass('text-success')
                        .text(stateValue);

                    $opLink.data('state', stateValue);
                    console.log($opLink.data('state'));
                },
                error: function () {
                    $stateTd
                        .removeClass('text-danger')
                        .addClass('text-danger')
                        .text('服务器错误请重试');

                    confirm.unsetConfirmed(role, id);
                },
            });

        });


    }

});

// ========= util fn ===============

function setCookie(cookieName, coockieValue, expiredays) {
    var cookieText = encodeURIComponent(cookieName) + '=' +
        encodeURIComponent(coockieValue);

    if (expiredays instanceof Date) {
        cookieText += "; expires=" + expiredays.toGMTString();
    }

    return (document.cookie = cookieText);
}

function getCookie(cookieName) {
    var value;

    decodeURIComponent(document.cookie)
        .split('; ')
        .forEach(function (cookie) {
            cookie = cookie.split('=');
            if (cookieName === cookie[0]) {
                value = cookie[1];
            }
        });

    return value;
}

function convertTimeString(seconds) {
    if (typeof seconds != 'number') return '';

    var time = new Date(seconds * 1000);
    return time.getFullYear() + '-' +
        time.getMonth() + '-' +
        time.getDay();
}


// ============= page fn ========================

function getPageTitle() {
    return $('.page-title').data('page');
}

function saveInfos(options) {
    $.ajax({
        url: options.url,
        method: options.method,
        data: options.form.serialize(),
        success: options.success,
        error: options.error
    });
}

function deleteImage(hash) {
    $.ajax({
        url: '/vendor/item_image',
        method: 'put',
        data: {
            image_hash: hash
        }
    });
}

function formDirtyCheck($form, origin) {
    var newValue = $form.serialize();
    var isDirty = newValue !== origin;
    return {
        isDirty: isDirty,
        origin: isDirty ? newValue : origin
    };
}

function genImageView(image) {
    return '<div class="col-md-3 col-sm-4 col-xs-6">' +
                '<div class="album-image" data-hash="' + image.hash + '">' +
                    '<a href="#" class="thumb" data-action="edit" data-toggle="modal" data-target="#gallery-image-modal">' +
                        '<img src="' + image.url + '" class="img-responsive" />' +
                    '</a>' +

                    '<a href="#" class="name">' +
                        '<span>' + image.name + '</span>' +
                        '<em>' + convertTimeString(image.created) + '</em>' +
                    '</a>' +

                    '<div class="image-options">' +
                        '<a href="#" data-action="trash" data-toggle="modal" data-target="#gallery-image-delete-modal"><i class="fa-trash"></i></a>' +
                    '</div>' +
                '</div>' +
           '</div>';
}

function setElemText($el, text) {
    if ($el.is('input')) $el.val(text);
    else $el.text(text);
}

function sendEnable($send, value) {
    setElemText($send, value);
    $send.removeClass('disabled');
}

function sendDisable($send, time, delayTime) {
    var timePass = parseInt((delayTime - time + parseInt(getCookie('clickTime'))) / 1000);  // convert second to millisecond
    $send.addClass('disabled');
    setElemText($send, timePass + ' 秒后点击再次发送');
}

function setCountDown($send, originValue, delayTime) {
    var countDown = setInterval(function () {
        if (Date.now() - getCookie('clickTime') >= delayTime - 1000) {
            clearTimeout(countDown);
            sendEnable($send, originValue);
            setCookie('clickTime', '', new Date(0));
        }
        else {
            sendDisable($send, Date.now(), delayTime);
        }
    }, 200);
}

function setFormDisabled($form) {
    $form.find('.form-control').attr('disabled', true);
}

function genDataAttrStr(data) {
    var dataAttrStr = '';
    for (var key in data) {
        dataAttrStr += 'data-' + key + '=' + '"' + data[key] + '"';
    }

    return dataAttrStr;
}

/**
 * 该函数用于填充定义列表的内容
 * @param $el
 * 需要填充数据的 dl 元素所在的父元素
 * @param prefix
 * dd 元素的 id 前缀, 如 'vendor-name', 'vendor-id' 中的 'vendor'
 * @param data
 * 用来填充的数据
 *
 **/
function setDlData($el, prefix, data) {
    $el
        .find('[id|="' + prefix + '"]')
        .each(function () {
            var key = this.id.split('-')[1];    // id 去掉前缀后的值
            var value = data[key];
            var $dd = $(this).next();

            if ($dd.children('img').length > 0) {
                $dd.children('img').attr('src', value);
            }
            else {
                $dd.text(value);
            }
        });
}
