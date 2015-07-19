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
            var mobileReg = /^((1[3-8][0-9])+\d{8})$/;
            return this.optional(element) || (length == 11 && mobileReg.test(value));
        });

        $.validator.addMethod('tel', function (value, element) {
            var telReg = /^\d{3,4}-?\d{7,9}$/;    //电话号码格式010-12345678
            return this.optional(element) || (telReg.test(value));
        });

        $.validator.addMethod('identity', function (value, element) {
            var idReg = /^\d{15}(\d\d[0-9xX])?$/;
            return this.optional(element) || (idReg.test(value));
        });

        $.validator.addMethod('password', function (value, element) {
            //大于等于6位，且同时包含数字和字母
            var passwdReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}$/;
            return this.optional(element) || (passwdReg.test(value));
        });

        $.validator.addMethod('customDate', function (value, element) {
            var dateReg = /^(\d{4})\/((0?([1-9]))|(1[1|2]))\/((0?[1-9])|([12]([1-9]))|(3[0|1]))$/;
            return this.optional(element) || (dateReg.test(value));
        });
    }

    // Dropzone
    var dz = {
        initDropzone: function ($el, opt) {
            $el.dropzone({
                url: opt.url,
                method: 'put',
                acceptedFiles: 'image/jpg, image/jpeg, image/png',
                addRemoveLinks: getPageTitle() !== 'item-edit',
                dictDefaultMessage: '拖动文件到此以上传',
                dictResponseError: '服务器{{ statusCode }}错误, 上传失败, 请稍后重试。',
                dictCancelUpload: '取消上传',
                dictCancelUploadConfirmation: '确定取消上传吗？',
                dictRemoveFile: '移除文件',

                init: function () {
                    this
                        .on('removedfile', function (file) {
                            var hash = $(file.previewElement).data('hash');
                            if (hash) deleteImage(hash);
                        })
                        .on('success', opt.success);
                }
            });
        },
        setPreviewError: function (file, message) {
            $(file.previewElement)
                    .removeClass('dz-success')
                    .addClass('dz-error')
                    .find('.dz-error-message span')
                    .text('上传失败!' + message);
        }
    };


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
            columnDefs: opt.columnDefs
        });
    }


    // toastr
    var toastrOpts = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-top-full-width",
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };


    // =========== page init ==================

    // Items page
    if (getPageTitle() === 'items') {
        var $confirmForm = $('#delete-confirm-form');

        initDatatable($('#items'), {
            ajax: "/vendor/items/datatable",
            columns: [
                {data: "id", bSortable: false, visible: false},
                {data: "item", bSortable: false},
                {data: "second_category_id", bSortable: false},
                {data: "price"},
                {data: "size", bSortable: false}
            ],
            columnDefs: [{
                targets: [5],
                data: "id",
                render: function (data) {
                    return "<a href='/vendor/items/" + data + "'>详情/编辑</a>";
                }
            },
            {
                targets: [6],
                data: {},
                render: function (data) {
                    return '<a href="javascript:void(0)" data-item="' + data.item + '" data-item-id="' + data.id + '" data-toggle="modal" data-target="#delete-confirm-modal">删除商品</a>';
                },
            }]
        });

        $('#items').delegate('[data-target="#delete-confirm-modal"]', 'click', function () {
            var $this = $(this);
            var id = $this.data('item-id');
            var item = $this.data('item');

            $confirmForm.data('item-id', id);
            $('#modal-item-name').text(item);
        });

        $('#modal-item-delete').click(function (e) {
            $.ajax({
                url: '/vendor/items/' + $confirmForm.data('item-id'),
                method: 'delete',
                success: function () {
                    window.location.reload();
                },
                error: function () {
                    window.location.reload();
                },
            });

            e.preventDefault();
        });
    }


    // Item Edit page
    if (getPageTitle() === 'item-edit') {
        var $itemEditForm = $('#edit-item-form');
        var originFormValue = $itemEditForm.serialize();

        // Edit-form
        $itemEditForm.delegate('.form-control', 'keydown', function () {
            $('#save').next().hide();
        });
        $itemEditForm.find('select').click(function () {
            $('#save').next().hide();
        });

        $('#save').click(function () {
            var $this = $(this);
            var originButtonText = $this.html();
            if ($this.hasClass('disabled')) return;

            //$this.addClass('disabled');
            var dirtyCheck = formDirtyCheck($itemEditForm, originFormValue);
            if (dirtyCheck.isDirty) {

                setButtonLoading($this);

                saveInfos({
                    url: window.location.pathname,
                    method: 'put',
                    form: $itemEditForm,
                    success: function (data) {
                        if (data.success) {
                            toastr.success('保存成功!');
                        }
                        else {
                            toastr.error(data.message, '提交失败!');
                        }

                        originFormValue = dirtyCheck.origin;
                        resetButton($this, originButtonText);
                    },
                    error: function (xhr) {
                        toastr.error('服务器'+ xhr.status +'错误', '提交失败!');
                        resetButton($this, originButtonText);
                    }
                });
            }
            else {
                toastr.warning('没有修改内容!');
            }
        });

        // init dropzone
        dz.initDropzone($('#img-upload'), {
            url: '/vendor/items/image?item_id=' + $itemEditForm.data('item-id'),
            success: function (file, data) {
                var $previewElement = $(file.previewElement);
                if (data.success) {
                    var image = data.image;
                    $previewElement.data('hash', image.hash);

                    var $album = $('.album-images');
                    if ($album.length > 0) {
                        $album.append($(genImageView({
                            name: file.name,
                            hash: image.hash,
                            url: image.url,
                            created: image.created
                        })));
                    }
                }
                else {
                    dz.setPreviewError(file, data.message);
                }
            }
        });

        // Item Album page
        var $albumImages = $('.album-images');
        var deleteImgHash = '';

        $albumImages
            // 修改 deleteImgHash 变量
            .delegate('[data-action="trash"]', 'click', function () {
                console.log('delete');
                deleteImgHash = $(this)
                    .parents('.album-image')
                    .data('hash');
            })
            // 修改大图弹窗中图片的 src
            .delegate('.album-image', 'click', function () {
                var src = $(this).find('.thumb img').attr('src');
                $('#gallery-image-modal')
                    .find('img').attr('src', src);
            });

        // 确认删除后发送删除请求并删除 gallery 中相应 ui
        $('#gallery-image-delete-modal')
            .find('#delete')
            .click(function () {
                $albumImages
                    .find('[data-hash=' + deleteImgHash + ']')
                    .parent()
                    .remove();

                deleteImage(deleteImgHash);
            });

        $('#sort-confirm').click(function () {
            var sort = [];
            $albumImages
                .find('.album-image')
                .each(function () {
                    sort.push($(this).data('hash'));
                });

            $.ajax({
                url: '/vendor/items/image_sort',
                method: 'post',
                data: sort.join(',')
            });
        });
    }


    // Item New page
    if (getPageTitle() === 'item-new') {
        var $newItemForm = $('#new-item-form');

        var nextHandler = function () {
            var $this = $(this);
            if ($this.hasClass('disabled')) {
                return;
            }

            if (!checkValidate($newItemForm)) {
                return;
            }

            var $link = $this.children('a');
            var originVal = $link.html();

            $this.addClass('disabled');
            $link.html('<i><span class="fa fa-spin fa-spinner"></span></i>');

            saveInfos({
                url: '/vendor/items/new_item',
                method: 'post',
                form: $('#new-item-form'),
                success: function (data) {

                    if (data.success) {
                        toastr.success('您可以继续添加商品图片', '商品添加成功!');

                        // init dropzone
                        dz.initDropzone($('#img-upload'), {
                            url: '/vendor/items/image?item_id=' + data.item_id,
                            success: function (file, data) {
                                var $previewElement = $(file.previewElement);
                                if (data.success) {
                                    var image = data.image;
                                    $previewElement.data('hash', image.hash);
                                }
                                else {
                                    dz.setPreviewError(file, data.message);
                                }
                            }
                        });

                        $newItemForm.bootstrapWizard('next');
                    }
                    else {
                        toastr.error(data.message, '提交失败');
                    }
                    $link.html(originVal);
                    $this.removeClass('disabled');
                },
                error: function (xhr) {
                    toastr.error('服务器'+ xhr.status +'错误', '提交失败');
                    $link.html(originVal);
                    $this.removeClass('disabled');
                },
            });
        };

        $('.wizard .next')
            .off('click')
            .click(nextHandler);
    }


    // Distributors page
    if (getPageTitle() === 'distributors') {
        var $distTable = $('#distributors');

        initDatatable($distTable, {
            ajax: "/vendor/distributors/datatable",
            columns: [
                {data: "id", bSortable: false, visible: false},
                {data: "name"},
                {data: "address", bSortable: false},
                {data: "contact_telephone", bSortable: false},
                {data: "contact_mobile", bSortable: false},
                {data: "contact", bSortable: false},
                {data: "created"},
                {data: "revocation_state", visible: false},
            ],
            columnDefs: [{
                targets: [8],
                data: {},
                render: function (data) {
                    var genRevocateLink = function (text) {
                        return '<a href="javascript:void(0)" data-toggle="modal" data-target="#revocation-modal" data-dist-name="' + data.name + '" data-dist-id="' + data.id + '">' + text + '</a>';
                    };

                    if (data.revocation_state == 'pendding') {
                        return '<span class="text-warning">审核中</span>';
                    }
                    else if (data.revocation_state == 'revocated') {
                        return '<span class="text-success">已取消授权</span>';
                    }
                    else if (data.revocation_state == 'rejected') {
                        return '<span class="text-danger">审核失败;</span>' +
                                genRevocateLink('点击再次提交审核');
                    }
                    else {
                        return genRevocateLink('取消授权');
                    }
                },
            }],
        });

        $('#distributors').delegate('[data-target="#revocation-modal"]', 'click', function () {
            var id = $(this).data('dist-id');
            var name = $(this).data('dist-name');
            var $contractForm = $('#contract-form');
            var actions = $contractForm
                            .attr('action')
                            .split('/');

            actions[3] = id;    // url: /vendor/distributors/{id}/revocation

            $('#modal-dist-name').text(name);
            $('#contract').val('');
            $contractForm.attr('action', actions.join('/'));
        });
    }


    // Invitation page
    if (getPageTitle() === 'dist-invitation') {
        $('#get-key').click(function () {
            var $this = $(this);
            if ($this.hasClass('disabled')) {
                return;
            }

            var originVal = $this.text();
            setButtonLoading($this);

            $.ajax({
                url: '/vendor/distributors/invitation',
                method: 'post',
                success: function (data) {
                    $('.invite-key').val(data)
                            .attr('contenteditable', true)
                            .focus().select();
                    resetButton($this, originVal);
                },
                error: function (xhr) {
                    toastr.error('服务器' + xhr.status + '错误.', '申请失败!');
                    resetButton($this, originVal);
                }
            });
        });
    }


    // Settings page
    if (getPageTitle() === 'settings') {
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

        $('#mobile').rules('add', {
            mobile: true,
            messages: {
                mobile: '请填写合法的手机号码'
            }
        });
        $('#telephone').rules('add', {
            tel: true,
            messages: {
                tel: '请填写合法的固定电话号码'
            }
        });
    }


    // Register page
    if ($('body').data('page') == 'register') {
        // 发送按钮倒计时
        var $send = $('.send');
        var DELAYTIME = 60000;  // 1min
        var originValue = $send.val() || $send.text();

        // 页面加载完成时获取发送按钮情况
        if (getCookie('clickTime')) {
            sendDisable($send, Date.now(), DELAYTIME);
            setCountDown($send, originValue, DELAYTIME);
        }

        $send.click(function () {
            if (!checkValidate($('#register'), '#mobile')) {
                return;
            }

            var $this = $(this);

            if ($this.hasClass('disabled')) return;

            setCookie('clickTime', Date.now());

            // 发送请求
            $.ajax({
                url: '/service/mobile_register_sms',
                method: 'post',
                data: {
                    mobile: $('#mobile').val()
                }
            });

            setCountDown($this, originValue, DELAYTIME);
        });
    }


    // Register_next or Reconfirm page
    if ($('body').data('page') == 'register-next' ||
            $('body').data('page') == 'reconfirm') {

        // form validate

        // only in register-next page
        if ($('body').data('page') == 'register-next') {
            $('#email').rules('add', {
                required: true,
                email: true,
                messages: {
                    required: '请输入您的邮箱',
                    email: '请输入合法的邮箱地址'
                }
            });

            $('#password').rules('add', {
                required: true,
                password: true,
                messages: {
                    required: '请设置密码',
                    password: '密码长度必须大于等于6位且为字母和数字的组合'
                }
            });

            $('#confirm_password').rules('add', {
                required: true,
                equalTo: '#password',
                messages: {
                    required: '请再次输入密码',
                    equalTo: '两次密码输入不一致'
                }
            });

            $('#agent_identity_front').rules('add', {
                required: true,
                messages: {
                    required: '请上传代理人身份证正面照片',
                }
            });

            $('#agent_identity_back').rules('add', {
                required: true,
                messages: {
                    required: '请上传代理人身份证反面照片',
                }
            });

            $('#license_image').rules('add', {
                required: true,
                messages: {
                    required: '请上传营业执照照片',
                }
            });
        }

        $('#agent_name').rules('add', {
            required: true,
            messages: {
                required: '请输入代理人姓名',
            }
        });

        $('#agent_identity').rules('add', {
            required: true,
            identity: true,
            messages: {
                required: '请输入代理人身份证',
                identity: '不合法的身份证号码'
            }
        });

        $('#name').rules('add', {
            required: true,
            messages: {
                required: '请填写厂家名称',
            }
        });

        $('#license_limit').rules('add', {
            required: true,
            customDate: true,
            messages: {
                required: '请填写营业期限',
                customDate: '不合法的日期格式, 格式: 2015/07/19',
            },
        });

        $('#telephone').rules('add', {
            required: true,
            tel: true,
            messages: {
                required: '请填写联系固话',
                tel: '不合法的电话号码',
            },
        });

        $('#province_cn_id').rules('add', {
            required: true,
            messages: {
                required: '请选择省级行政区',
            }
        });

        $('#city_cn_id').rules('add', {
            required: true,
            messages: {
                required: '请选择市级行政区',
            }
        });

        $('#district_cn_id').rules('add', {
            required: true,
            messages: {
                required: '请选择区级行政区',
            }
        });

        $('#address').rules('add', {
            required: true,
            messages: {
                required: '请填写联系地址',
            }
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

    var time = new Date('seconds * 1000');
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
        url: '/vendor/items/image',
        method: 'delete',
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

function setCountDown($send, originValue, DELAYTIME) {
    var countDown = setInterval(function () {
        if (Date.now() - getCookie('clickTime') >= DELAYTIME - 1000) {
            clearTimeout(countDown);
            sendEnable($send, originValue);
            setCookie('clickTime', '', new Date(0));
        }
        else {
            sendDisable($send, Date.now(), DELAYTIME);
        }
    }, 200);
}

function setButtonLoading($el) {
    $el.addClass('disabled')
        .html('<i><span class="fa fa-spin fa-spinner"></span></i>');
}
function resetButton($el, innerHtml) {
    $el.removeClass('disabled')
        .html(innerHtml);
}

function checkValidate($form, selector) {
    if($form.hasClass('validate')) {
        var valid = null,
            $el = $form.find(selector);

        if (selector) {
            if ($el.length > 0) {
                valid = $el.valid();
            }
            else {
                return;
            }
        }
        else {
            valid = $form.valid();
        }


        if(!valid) {
            $form.data('validator').focusInvalid();
            return false;
        }
    }

    return true;
}
