// profile_ui

var Item = React.createClass({
  getInitialProps: function() {
    return {
      // item: {
      //   item_id: 20,
      //   item: "名字",
      //   image_url: ""
      //   price: "2000",
      //   deleted: 0
      // }
    };
  },
  render: function() {
    var dialogStyle = {
      display: this.props.item.deleted ? "none" : "block"
    };
    return (
      <div class="item">
        <a href={"/item?id=" + this.props.item.item_id}>
        <img src={this.props.image_url} alt={this.props.item.item} />
        <span class="del glyphicon glyphicon-trash"></span>
        <div class="dialog" style={dialogStyle}>
          <div class="info">
            <p>确定删除吗？</p>
            <div class="btn-group">
                <button class="confirm">确认</button>
                <button class="cancle">取消</button>
            </div>
          </div>
        </div>
        <div class="item-info">
          <h5><a href="/item?id={{ item.id }}">{this.props.item.item}</a></h5>
          <div class="price">&yen; {this.props.item.price}</div>
        </div>
      </div>
    );
  }
});

var Items = React.createClass({
  getInitialState: function() {
    return {
      collections: [
        {
          item_id: 10,
          item: "名字1",
          image_url: ""
          price: "2300",
          deleted: 0
        }, {
          item_id: 20,
          item: "名字2",
          image_url: ""
          price: "2000",
          deleted: 0
        }
      ]
    };
  },
  setCollection: function(collections) {
    this.setState({
      collections: collections
    });
  },
  render: function() {
    return (
      <div class="item-wrapper clearfix">
        this.state.collections.map(function (item, i) {
          return <Item item={item} />
        })
      </div>
    );
  }
});

function getItems(page, callback) {
  page = page || 1;
  $.get("/collection", {
    page: page
  }, callback);
}

function init() {
  // 确认删除dialog屏蔽原本的商品跳转链接
  $('.collections').delegate('.dialog', 'click', function(e) {
    e.preventDefault(); // 为什么 stopPropagation 无效？
  });

  $('.collections .del').click(function(e) {
    var $dialog = $(this).parent().find('.dialog');
    $dialog.addClass('dialog-confirm').css('display', 'block');
    e.preventDefault();
  });

  $('.dialog .cancle').click(function() {
    var $dialog = $(this).parents('.dialog');
    $dialog.removeClass('dialog-confirm').hide();
  });

  $('.dialog .confirm').click(function(e) {
    $(this).parents('.item').remove();
    e.preventDefault();

    // 发送删除收藏的ajax请求
  });

  $('.verified').on('input', function() {
    var id = $(this).attr('id');
    var checkTip = checkInfo(id);
    if (checkTip) {
      $('.form-tip').text(checkTip);
    } else {
      $('.form-tip').text("");
    }
  });

  $('#settingSubmit').click(function(e) {
    var checkTip = checkInfo();
    if (checkTip) {
      $('.form-tip').text(checkTip);
      e.preventDefault();
    }
  });
}

function checkInfo(id) {
  var regExps = getRegs();
  var idHash = {
    mobile: "手机号码",
    email: "邮箱"
  };
  if (id) {
    var value = $('#' + id).val();
    if (value && !regExps[id].test(value)) {
      return idHash[id] + "格式不正确，请重新输入";
    }
    return;
  } else {
    for (var k in idHash) {
      var checkTip = checkInfo(k);
      if (checkTip) {
        return checkTip;
        break;
      }
    }
  }
}

$(function() {
  init();
  var currentPage = 1;
  var items = React.render(
    <Items />,
    document.getElementById('collections')
  );
  getItems(currentPage, function(data) {
    items.setCollection(data.collections);
  });
});
