/**
 * TODO 考虑使用 alasql 或者 localForage 存储客户端的访问信息, 不知道可不可行
 * 存储最后一个每个相似图片请求的最后一个返回id的边界,总的key为 all, 其他的key为id
 * [{all:'object id'},{ 'request object id': 'response object id'}]
  */
var lastItemId = [];

var getImageObject = {};

var gridMasonry = $('.grid').masonry({
    // options...
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true
});

// Grid layout
$(".grid-item .actions .right a").click(function (e) {
    console.log('e: ', e);
});

// Lazyload
var topic_page = 1;
var pic_page = 1;
$('#page-marker').on('lazyshow', function () {
    $.ajax({
        url: "/api/v2/topics?page=" + topic_page
    }).done(function (responseText) {
        console.info(responseText);
        var itemLength = 0;
        if (!!responseText.data && _.isArray(responseText.data)) {
            itemLength = _.size(responseText.data);
        }
        var elements = [];
        responseText.data.forEach(function (item) {
            elements.push($("#topicListTmp").tmpl({topic: item}));
        });
        $('#topic_list').append(elements);
        if (itemLength >= 10) {
            $(window).lazyLoadXT();
            $('#page-marker').lazyLoadXT({visibleOnly: false, checkDuplicates: false});
        } else {
            $("#page-marker").remove();
        }
        topic_page++;

    });

}).lazyLoadXT({visibleOnly: false});

$('#pic-page-marker').on('lazyshow', function () {
    $.ajax({
        url: "/api/v2/images?type=image&limit=5&page=" + pic_page
    }).done(function (responseText) {
        var itemLength = responseText.data.length;
        responseText.data.forEach(function (item) {
            var itemHtml = $("#picBoxTmp").tmpl({item: item});
            lastItemId['all'] = item.id;
            var jpicelements = $(itemHtml);
            gridMasonry.append(jpicelements)
                .masonry('appended', jpicelements);
        });
        gridMasonry.imagesLoaded().progress(function () {
            gridMasonry.masonry('layout');
        });
        if (itemLength >= 5) {
            gridMasonry.masonry('layout');
            $(window).lazyLoadXT();
            $('#pic-page-marker').lazyLoadXT({visibleOnly: false, checkDuplicates: false});
        } else {
            gridMasonry.masonry('layout');
            $("#pic-page-marker").remove();
        }
        pic_page++;
    });
}).lazyLoadXT({visibleOnly: false});

// TODO 考虑是否使用 http://www.dropzonejs.com/ 上传插件修改上传代码, 支持拖拽上传
// Upload
//var _csrf = $('meta[name=csrf-token]').attr('content');
//var uploader = new Q.Uploader({
//    url: "imageupload?type=file&_csrf=" + _csrf,
//    target: document.getElementById("upload_area"),
//    view: document.getElementById("preview"),
//    allows: ".jpg,.png,.gif,.bmp,.jpeg",
//    auto: false,
//    multiple: false,
//    dataType: "json",
//    data: {title: 'test'},
//    //图片缩放
//    // DONE(hhdem) 如果是在win环境下, 打开图片缩放将无法成功上传
//    // scale: {
//    //     //最大图片大小(width|height)
//    //     maxWidth: 700
//    // },
//    UI: {
//        init: function () {
//            console.info('UI init method');
//        },
//        draw: function (task) {
//            var self = this,
//                ops = self.ops,
//                boxView = ops.view;
//
//            if (!boxView) return;
//
//            var name = task.name;
//
//            var li = '';
//            loadImage(task.file,
//                function (img, data) {
//                    img.style.width = '100%';
//                    var html =
//                        '<div class="u-img"></div><span class="u-loaded"></span><span class="u-total"></span>';
//                    var taskId = task.id,
//                        box = Q.createEle("div", "u-item", html);
//
//                    box.taskId = taskId;
//
//                    var boxImage = Q.getFirst(box);
//
//                    task.box = box;
//                    boxImage.appendChild(img);
//                    //添加到视图中
//                    boxView.appendChild(box);
//
//                    //---------------- 预览图片并更新UI ----------------
//                    $('#preview-desc').html(name);
//                    $('#preview').append(img);
//                },
//                {orientation: true} // Options
//            );
//            //task.file = li;
//            var html =
//                '<div class="u-img">'+li+'</div><span class="u-loaded"></span><span class="u-total"></span>';
//
//
//            //self.previewImage(boxImage, task, ops);
//        },
//        update: function (task) {
//
//        }
//    },
//    on: {
//        //添加之前触发
//        add: function (task) {
//            if (task.disabled) return alert("允许上传的文件格式为：" + this.ops.allows);
//            $('#upload_view').show();
//            $('#upload_area').hide();
//        },
//        //图片预览后触发
//        preview: function (data) {
//            console.log(data.task.name + " : " + data.src);
//        },
//        //图片压缩后触发,如果图片或浏览器不支持压缩,则不触发
//        scale: function (data) {
//            console.log(data.task.name + " : 已压缩！");
//        },
//        //上传之前触发
//        upload: function (task) {
//            //可针对单独的任务配置参数(POST方式)
//            var boardSelected = $('#image_upload .right-part .boardlist .item.selected');
//            uploader.data = {
//                title: $('#preview-desc').val(),
//                board: boardSelected.data("id")
//            };
//        },
//        //上传完成后触发
//        complete: function (task) {
//            if (task.state != Q.Uploader.COMPLETE) return console.log(task.name + ": " + Q.Uploader.getStatusText(task.state) + "!");
//
//            var json = task.json;
//            if (!json.success) {
//                $('#board_message_alert .alert-content').html(json.msg);
//                $('#board_message_alert').fadeIn();
//                return console.error(task.name + ": 服务器未返回正确的数据！", json.msg);
//            }
//
//            console.log(task.name + ": 服务器返回 " + (task.response || ""));
//            var resJson = JSON.parse(task.response);
//            var item = resJson.data[0];
//            var itemHtml = $("#picBoxTmp").tmpl({item: item, highlight: true, image: $('#preview').children('canvas').html()});
//
//            var jpicelements = $(itemHtml);
//            // 上传成功后, 直接把预览里的 canvas 加入 _pic_box 里面
//            jpicelements.children('#pic_'+item.id).children('img').remove();
//            jpicelements.children('#pic_'+item.id).prepend($('#preview').children('canvas'));
//            // TODO 把预览里的board信息也添加到 _pic_box 里面
//            //var jpicelements = $('<div class="grid-item heightlight" id="'+resJson.id+'"><div class="grid-item-content"><img src="' + resJson.url + '" title="'+resJson.title+'" alt="'+resJson.title+'"/></div></div>');
//
//            //gridMasonry.append(jpicelements)
//            //    .masonry('prepended', jpicelements);
//            gridMasonry.append(jpicelements).masonry('insertItems', 1, jpicelements);
//            gridMasonry.imagesLoaded().progress(function () {
//                gridMasonry.masonry('layout');
//            });
//            //this.list  为上传任务列表
//            //this.index 为当前上传任务索引
//            if (this.index >= this.list.length - 1) {
//                //所有任务上传完成
//                console.log("所有任务上传完成：" + new Date());
//                $('#image_upload').modal('hide');
//                $('#upload-submit').button('reset');
//            }
//        }
//
//    }
//});
//
//// 开始上传图片
//document.getElementById("upload-submit").onclick = function () {
//    var $this = $(this);
//    if(boardList.length == 0) {
//        // 如果没有 Board 提示创建
//        $('#board_message_alert .alert-content').html('请先创建一个 Board 吧!');
//        $('#board_message_alert').fadeIn();
//        return;
//    }
//    $this.button('loading');
//    uploader.start();
//};
//
//$('#image_upload').on('hidden.bs.modal', function (e) {
//    $('#upload-submit').button('reset');
//    $('#upload_area').show();
//    $('#upload_view').hide();
//    $('#preview').html('');
//});
//$('#image_upload').on('hide.bs.modal', function (e) {
//    $('#upload-submit').button('reset');
//    $('#upload_area').show();
//    $('#upload_view').hide();
//    $('#preview').html('');
//});

// 绑定like按钮的点击事件
$(document).on('click', '.like-btn', function (event) {
    if (!auth()) {
        return;
    }
    if (!event.currentTarget.dataset.id) {
        return;
    }
    console.log(event.currentTarget.dataset.id);
    likePic (event.currentTarget.dataset.id);
});

// 绑定更多相似图片按钮点击事件
$(document).on('click', '.more-similar-btn', function (event) {
    if (!event.currentTarget.dataset.id) {
        return;
    }
    similarPics(event.currentTarget.dataset.id);
});

// 点击 Get 图片到自己的 Board, 弹出 Modal 层
$(document).on('click', '#pic_list .get-pic-btn', function (event) {
    if (!auth()) {
        return;
    }
    if (!event.currentTarget.dataset.id || !event.currentTarget.dataset.src) {
        return;
    }
    console.log(event.currentTarget.dataset.id);
    console.log(event.currentTarget.dataset.src);
    getImageObject.topic_id = event.currentTarget.dataset.id;
    $('#get-preview-image-desc').val('');
    $('#get-preview-image').html('<img src="'+event.currentTarget.dataset.src+'">');
    $('#get-image-submit').attr('data-id', event.currentTarget.dataset.id);
    $('#get-image-submit').attr('data-image', event.currentTarget.dataset.src);
    $('#get_image_modal').modal('show');
});

// 保存要Get的图片信息
$(document).on('click', '#get-image-submit', function (event) {
    console.log(event.currentTarget.dataset);
    getImageObject.desc = $('#get-preview-image-desc').val();
    getImageObject.image_fixed = event.currentTarget.dataset.image;
    console.log('getImageObject:', getImageObject);
    $.ajax({
        type: "POST",
        url: "/api/v2/images/get",
        data: getImageObject
    }).done(function (response) {
        console.log(response);
        if (response.success) {
            // DONE (hhdem) get的图片，免刷新直接插入图片列表中
            var itemHtml = $("#picBoxTmp").tmpl({item: response.data, highlight: true});
            var jpicelements = $(itemHtml);
            gridMasonry.append(jpicelements).masonry('insertItems', 1, jpicelements);
            gridMasonry.imagesLoaded().progress(function () {
                gridMasonry.masonry('layout');
            });
            $('#get_image_modal').modal('hide');
        }
    }).error(function(res){
        if (res.status == 401) {
            $('#get_image_modal').modal('hide');
            $('#signin_modal').modal('show');
        }
    });
});

// chrome插件的弹出页面，进行Get图片操作
$(document).on('click', '#get-image-chrome-submit', function (event) {
    console.log(event.currentTarget.dataset);
    $('#get-image-chrome-submit').button('loading');
    var getImageChromeObj = {};
    getImageChromeObj.desc = $('#get-image-desc').val();
    getImageChromeObj.media = event.currentTarget.dataset.src;
    getImageChromeObj.profile_source = event.currentTarget.dataset.url;
    getImageChromeObj.board_id = $('.right-part .boardlist .selected').attr("data-id");
    $.ajax({
        type: "POST",
        url: "/image/create/bookmarklet",
        data: getImageChromeObj
    }).done(function (response) {
        console.info(response);
        if (!response.success) {
            $('#get_image_chrome_error_modal').modal('show');
            return;
        }
        window.close();
    }).error(function(res){
        console.error(res);
        $('#get_image_chrome_error_modal').modal('show');
    });
});

//
//// 绑定Board 查询事件
//$(document).on('keyup', '.pin-create .right-part .search-input', function (event) {
//    if (!event.currentTarget) {
//        return;
//    }
//    // TODO 根据输入的关键词模糊查询Board列表,并刷新 boardlist 的显示列表
//    searchBoard ($(this), event.currentTarget.value);
//});
//
//// 绑定添加Board按钮
//$(document).on('click', '.pin-create .right-part .createboard', function (event) {
//    if (!event.currentTarget) {
//        return;
//    }
//    $(this).parent().prev().prev().css({"height":"220px"});
//    $(this).hide();
//    createBoard (event.currentTarget.dataset.text);
//});

// 绑定预览图片的查看
//$(document).on('click', '#pic_list .preview-image', function (event) {
//    console.log(event.currentTarget.dataset.id);
//    console.log(event.currentTarget.dataset.src);
//    $('#get-preview-image-desc').val('');
//    $('#baidu_image_holder').html('<img src="'+event.currentTarget.dataset.src+'">');
//});

function similarPics(picid) {
    var sid = lastItemId['all'];
    if (!picid) {
        return;
    }

    if (!!lastItemId[picid]) {
        sid = lastItemId[picid];
    }
    var data = {
        id: picid,
        sid: sid
    };
    $.ajax({
        url: "/api/v2/images/sim",
        data: data
    }).done(function (responseText) {
        console.log(responseText);
        var items = gridMasonry.masonry('getItemElements');
        var rids = _.map(responseText.data, 'id');
        var aids = _.map(items, 'id');
        var needInsertItem = _.filter(responseText.data, function (o) {
            return _.includes(_.difference(rids, aids), o.id)
        });
        needInsertItem.forEach(function (item) {
            var itemHtml = $("#picBoxTmp").tmpl({item: item, highlight: true});
            lastItemId[picid] = item.id;
            var jpicelements = $(itemHtml);
            var items = gridMasonry.masonry('getItemElements');
            var clickIndex = 0;
            _.find(items, function (e) {
                clickIndex++;
                return e.id == picid;
            });
            gridMasonry.append(jpicelements).masonry('insertItems', clickIndex, jpicelements);
        });
        gridMasonry.imagesLoaded().progress(function () {
            gridMasonry.masonry('layout');
        });
    });
}

function likePic(picid) {
    if (!picid) {
        return;
    }
    var data = {
        id: picid
    };
    $.ajax({
        type: "POST",
        url: "/api/v2/images/like",
        data: data
    }).done(function (response) {
        if(!response.success) {

            return console.error("Error：", response);
        }
        var likeA = $('#'+picid + ' .actions .right a');
        if (likeA.hasClass('unlike')) {
            $('#'+picid + ' .actions .right a').removeClass('unlike');
        } else {
            $('#'+picid + ' .actions .right a').addClass('unlike');
        }
        var likePreviewBtn = $('#preview_modal #preview_modal_like_btn');
        if (likePreviewBtn.hasClass('unlike')) {
            likePreviewBtn.removeClass('unlike');
        } else {
            likePreviewBtn.addClass('unlike');
        }
    }).error(function(res){
        if (res.status == 401) {
            $('#signin_modal').modal('show');
        }
    });
}
//
//function selectBoard (selectedElem) {
//    var boardid = selectedElem.dataset.id;
//    if (!boardid) {
//        return;
//    }
//    var selectedBoard = $(selectedElem);
//
//    var boardE = selectedBoard.parent().children('#'+boardid);
//    var selectedE = selectedBoard.parent().children('.selected');
//    getImageObject.board_id = boardid;
//    if (!boardE.hasClass('selected')) {
//        selectedE.removeClass('selected');
//        boardE.addClass('selected');
//    }
//}
//
//function searchBoard (obj, searchText) {
//    if (!obj) {
//        return;
//    }
//    var refreshListTarget = obj.next().next();
//    var createTextTarget = obj.next().next().next().next();
//    if (searchText) {
//        refreshListTarget.css({"height":"180px"});
//        createTextTarget.find('.createboard').show();
//        createTextTarget.find('.createboard').attr("data-text", searchText);
//        createTextTarget.find('.text').html(searchText);
//    } else {
//        refreshListTarget.css({"height":"220px"});
//        createTextTarget.find('.createboard').hide();
//        createTextTarget.find('.text').html('');
//    }
//
//}
//
//function createBoard (boardName) {
//    if (!boardName) {
//        return;
//    }
//    var boardItem = {
//        title: boardName
//    };
//    $.ajax({
//        type: "POST",
//        url: "api/v2/boards",
//        data: {
//            title: boardName
//        }
//    }).done(function (responseText) {
//        if (!responseText.success) {
//            return ;
//        }
//        boardItem._id = responseText.board;
//        boardItem.title = responseText.title;
//        boardList.splice(0, 0, boardItem);
//        showBoardList($('.pin-create .right-part .boardlist .scrollable .recent'), boardList);
//    });
//}
//
//function showBoardList (target, boards) {
//    if (!target || !boards) {
//        return;
//    }
//    target.html('');
//    var markup = '{{each boards}}<div class="item {{if $index == 0}}selected{{/if}}" data-id="${boards[$index]._id}" id="${boards[$index]._id}" data-title="${boards[$index].title}">' +
//                    '<i class="icon history"></i>${boards[$index].title}<div class="controller"></div>' +
//                 '</div>{{/each}}';
//    if (boards.length) {
//        getImageObject.board_id = boards[0]._id;
//    } else {
//        $('#board_message_alert .alert-content').html('创建一个 Board 吧!');
//        $('#board_message_alert').fadeIn();
//    }
//    $("#boardTemplate").tmpl({boards: boards}).appendTo(target);
//
//    //$.template( "boardTemplate", markup );
//    //$.tmpl( "boardTemplate", {boards: boards} )
//    //    .appendTo(target);
//}

