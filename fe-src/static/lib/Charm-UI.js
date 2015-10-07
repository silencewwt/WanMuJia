// 整体组件
var AddressList = React.createClass({displayName: "AddressList",
    getInitialState: function() {
        return {
            nowAddress: null,
            isWrapShow: false
        };
    },
    handleBtnClick: function() {
        this.setState({isWrapShow: !this.state.isWrapShow});
    },
    handleSelectAddress: function(selectCt) {
        this.setState({nowAddress: selectCt,isWrapShow: false});
        if(this.props.setCity) {
            this.props.setCity(selectCt);
        }
    },
    render: function() {
        return (
            React.createElement("div", {className: "AddressList"}, 
                React.createElement(AddressDropButton, {triangleState: this.state.isWrapShow, onClick: this.handleBtnClick}, 
                    this.state.nowAddress?this.state.nowAddress:this.props.localAddress
                ), 
                this.state.isWrapShow?
                    React.createElement(AddressWrap, {addressData: this.props.addressData, localAddress: this.props.localAddress, handleSelectAddress: this.handleSelectAddress})
                    :null
                
            )
        );
    }
});

// 下拉按钮
var AddressDropButton = React.createClass({displayName: "AddressDropButton",
    handleClick: function() {
        this.props.onClick();
    },
    render: function() {
        return (
            React.createElement("button", {className: "AddressDropButton", onClick: this.handleClick}, 
                this.props.children, 
                React.createElement("span", {className: "triangle "+this.props.triangleState})
            )
        );
    }
});

// 地址操作框容器
var AddressWrap = React.createClass({displayName: "AddressWrap",
    render: function() {
        return (
            React.createElement("div", {className: "AddressWrap"}, 
                React.createElement("div", {className: "AddressCont"}, 
                    React.createElement(AddressLocation, {localAddress: this.props.localAddress, handleSelectAddress: this.props.handleSelectAddress}), 
                    React.createElement(AddressSearchInput, {addressData: this.props.addressData, handleSelectAddress: this.props.handleSelectAddress}), 
                    React.createElement(AddressListWrap, {addressData: this.props.addressData, handleSelectAddress: this.props.handleSelectAddress})
                )
            )
        );
    }
});

// 定位当前地址
var AddressLocation = React.createClass({displayName: "AddressLocation",
    handleClick: function() {
        this.props.handleSelectAddress(this.props.localAddress);
    },
    render: function() {
        return (
            React.createElement("div", {className: "AddressLocation"}, 
                "当前定位：", React.createElement("span", {onClick: this.handleClick}, this.props.localAddress)
            )
        );
    }
});

// 地址搜索
var AddressSearchInput = React.createClass({displayName: "AddressSearchInput",
    getInitialState: function() {
        return {
            result: [],
        };
    },
    handleResultClick: function(e) {
        var address = e.target.getAttribute('data');
        this.props.handleSelectAddress(address);
    },
    handleSearch: function(event) {
        var cont = event.target.value;
        var len = cont.length;
        var addressData = this.props.addressData;
        // 判断是汉字还是拼音
        var reg=/^[\u4E00-\u9FA5]+$/;
        if(reg.test(cont)) {
            // 是汉字处理
            var _resultH = [];
            var j = 0;
            for(var keyH in addressData) {
                for(var keyHS in addressData[keyH]) {
                    if(addressData[keyH][keyHS].city.substring(0,len) == cont) {
                        _resultH[j]  = addressData[keyH][keyHS].city;
                        j++;
                    }
                }
            }
            this.setState({result: _resultH});
            return ;
        }
        // 是拼音
        var FL = cont.substring(0,1).toLocaleUpperCase();
        var resultFL = addressData[FL];
        var _result = [];
        var i = 0;
        for(var key in resultFL) {
            if(key.substring(0,len) == cont.toLocaleLowerCase()) {
                _result[i]  = resultFL[key].city;
            }
            i++;
        }
        this.setState({result: _result});
    },
    render: function() {
        var _handleResultClick = this.handleResultClick;
        var resultNodes = this.state.result.map(function (result) {
            return (
                React.createElement("li", {data: result, onClick: _handleResultClick}, result)
            );
        });
        return (
            React.createElement("div", {className: "AddressSearch"}, 
                "搜索：", 
                React.createElement("input", {onChange: this.handleSearch}), 
                React.createElement("ul", {className: "AddressSearchResult"}, 
                    resultNodes
                )
            )
        );
    }
});

// 地址列表容器
var AddressListWrap = React.createClass({displayName: "AddressListWrap",
    render: function() {
        var addressData = this.props.addressData;
        var handleSelectAddress = this.props.handleSelectAddress;
        var rowNodes = function(data) {
            var cont = [];
            var i = 0;
            for(var key in data) {
                cont[i]  = React.createElement(AddressListRow, {key: key, keyData: key, data: data[key], handleSelectAddress: handleSelectAddress});
                i++;
            }
            return cont;
        }(addressData);
        return (
            React.createElement("div", {className: "AddressListWrap"}, 
                rowNodes
            )
        );
    }
});

// 地址列表行
var AddressListRow = React.createClass({displayName: "AddressListRow",
    handleClick: function(e) {
        var address = e.target.getAttribute('data');
        this.props.handleSelectAddress(address);
    },
    render: function() {
        var handleClick = this.handleClick;
        var dataNodes = function(data) {
            var cont = [];
            var i = 0;
            for(var key in data) {
                cont[i]  = React.createElement("span", {key: "p"+key}, React.createElement("span", {data: data[key].city, key: i, onClick: handleClick}, data[key].city));
                i++;
            }
            return cont;
        }(this.props.data);
        return (
            React.createElement("div", {className: "AddressListRow"}, 
                React.createElement("span", {className: "keyData"}, this.props.keyData), 
                React.createElement("span", {className: "dataWrap"}, dataNodes)
            )
        );
    }
});

'use strict'

//  ==================================================
//  Component: AddressPicker
//
//  Include: AddressList AddressSearch
//
//  Dependence: reqwest.js
//
//  Description:  Jsx for AddressPicker
//
//  TODO: [@TongchengQiu] AddressList 更换城市后调用 setCity 设置城市
//          你可以根据 AddressPicker 的 state.address 判断是否已经进行了搜索
//  ==================================================

var AddressPicker = React.createClass({displayName: "AddressPicker",
  getInitialState: function() {
    return {
      city: "北京",
      currentCity: null,
      address: null
    };
  },
  getDefaultProps: function() {
    return {};
  },
  componentWillMount: function() {
    var myCity = new BMap.LocalCity();
    myCity
      .get(function(res) {
        var currentCity = res.name;
        this.setState({
            currentCity: currentCity
        });
      }.bind(this));
  },
  setAddress: function(ad) {
    this.setState({
      address: ad
    });
  },
  setCity: function(ct) {
    this.setState({
      city: ct
    });
  },
  render: function() {
    var addressPickerActiveStyle = this.state.address
      ? this.props.addressPickerActiveStyle
      : {};
    return (
      React.createElement("div", {className: "address-picker", style: addressPickerActiveStyle}, 
        React.createElement(AddressList, {setCity: this.setCity, localAddress: this.state.currentCity, addressData: this.props.addressData}), 
        React.createElement(AddressInput, {city: this.state.city, searchSubmitHandler: this.setAddress}), 
        React.createElement(AddressMap, {addressKeyword: this.state.address, city: this.props.city})
      )
    );
  }
});

'use strict'

//  ==================================================
//  Component: AddressSearch
//
//  Include: AddressInput AddressMap
//
//  Dependence: reqwest.js
//
//  Description:  Jsx for AddressSearch
//
//  TODO: [add] 增加各项参数
//  ==================================================

/* AddressSearch */
var AddressSearch = React.createClass({displayName: "AddressSearch",
  getInitialState: function() {
    return {
      address: null
    };
  },
  getDefaultProps: function() {
    return {
      inputWidth: 400,
      inputTip: "输入想要搜索的地址",
      searchBtnText: "搜索",
      city: "北京"
    }
  },
  componentWillMount: function() {
    var myCity = new BMap.LocalCity();
    myCity
      .get(function(res) {
        var currentCity = res.name;
        this.setCity(currentCity);
      }.bind(this));
  },
  setAddress: function(ad) {
    this.setState({
      address: ad
    });
  },
  setCity: function(ct) {
    this.setState({
      city: ct
    });
  },
  render: function() {
    return (
      React.createElement("div", {className: "address-search"}, 
        React.createElement(AddressInput, {city: this.props.city, inputTip: this.props.inputTip, inputWidth: this.props.inputWidth, searchBtnText: this.props.searchBtnText, searchSubmitHandler: this.setAddress}), 
        React.createElement(AddressMap, {addressKeyword: this.state.address, city: this.props.city})
      )
    );
  }
});

/* AddressInput */
var AddressInput = React.createClass({displayName: "AddressInput",
  getInitialState: function() {
    return {
      keyword: null
    };
  },
  getDefaultProps: function() {
    return {
      inputWidth: 400,
      inputTip: "输入想要搜索的地址",
      searchBtnText: "搜索",
      city: "北京"
    }
  },
  searchSubmit: function() {
    var keyword = this.getDOMNode()
      .children[0]
      .value;
    this.props
      .searchSubmitHandler(keyword);
  },
  checkEnter: function(e) {
    (e.keyCode === 13) && this.searchSubmit();
  },
  componentDidMount: function() {
    var mapAutoComplete = new BMap.Autocomplete({
      "input": "_addressSearchKeyword",
      "location": this.props.city
    });
  },
  render: function() {
    var keywordStyle = {
      width: this.props.inputWidth
    };
    return (
      React.createElement("div", {className: "address-input"}, 
        React.createElement("input", {className: "input-keyword", id: "_addressSearchKeyword", onKeyUp: this.checkEnter, placeholder: this.props.inputTip, style: keywordStyle}), 
        React.createElement("button", {className: "input-commit", onClick: this.searchSubmit}, this.props.searchBtnText)
      )
    );
  }
});

/* AddressMap */
var AddressMap = React.createClass({displayName: "AddressMap",
  getInitialState: function() {
    return {
      mapLocalObj: null,
      itemsNumber: 0,
      itemsList: [],
      itemActive: 0
    };
  },
  getDefaultProps: function() {
    return {
      mapSearchgeotableId: 121763,
      mapSearchTags: "",
      mapSearchFilter: ""
    }
  },
  componentDidMount: function() {
    this.map = new BMap.Map("_addressMapMain", {
      enableMapClick: false
    });
    this.map
      .centerAndZoom(this.props.city, 12);
  },
  componentWillReceiveProps: function(nextProps) {
    nextProps.addressKeyword && this.getNearby(nextProps.addressKeyword);
  },
  getNearby: function(keyword, page) {
    // 地址解析获取经纬度
    var myGeo = new BMap.Geocoder();
    var _this = this;
    myGeo
      .getPoint(keyword, function(point) { // 解析成功后的回调 搜索信息
        if (point) {
          reqwest({
            url: 'http://api.map.baidu.com/geosearch/v3/nearby',
            type: 'jsonp',
            data: {
              ak: 'sdp9qCbToS7E23nDRxaAAwbh',
              geotable_id: 121763,
              location: point.lng + ',' + point.lat,
              radius: 10000,
              page_index: page || 0,
              page_size: 50
            },
            jsonpCallback: 'callback',
            success: function(res) {
              _this.setState({
                itemsNumber: res.total,
                itemsList: res.contents
              });
              _this.showNearby();
              _this.map
                .centerAndZoom(_this.props.addressKeyword, 12);
            }
          })
        } else {
          alert("未找到该区域信息");
        }
      }.bind(this), this.props.city);
  },
  showNearby: function() {
    var _this = this;
    for (var k in this.state.itemsList) {
      var point = new BMap.Point(this.state.itemsList[k].location[0], this.state.itemsList[k].location[1]);
      var marker = new BMap.Marker(point);
      var label = new BMap.Label(String.fromCharCode(65 + parseInt(k)), {
        offset: new BMap.Size(4, 2)
      });
      label.setStyle({
        border: 'none',
        backgroundColor: 'transparent',
        color: '#FAFAFA'
      });
      marker.setLabel(label);
      marker.setTitle(this.state.itemsList[k].title);
      marker
        .addEventListener('click', function(e) {
          _this.showInfoWindow(this.getLabel().content.charCodeAt(0) - 65);
        });
      this.map
        .addOverlay(marker);
    }
    this.state.itemsList.length && this.showInfoWindow(0);
  },
  showInfoWindow: function(index) {
    if (index !== this.state.itemActive || 1) {
      var point = new BMap.Point(this.state.itemsList[index].location[0], this.state.itemsList[index].location[1]);
      var itemInfo = this.state.itemsList[index];
      var title = itemInfo.title;
      var address = itemInfo.address;
      var tel = itemInfo.tel;
      var content = '<p class="map-info-window">地址：' + address + '<button class="map-info-btn">进入体验店</button>' + '</p>';
      var infoWindow = new BMap.InfoWindow(content, {
        title: title,
        width: 290,
        panel: "panel",
        enableAutoPan: true,
        offset: new BMap.Size(0, -25)
      });
      this.setState({
        itemActive: + index
      });
      this.map
        .openInfoWindow(infoWindow, point);
    }
  },
  clickMapItem: function(e) {
    var ele = e.target;
    var eleClass = ele.getAttribute('class');
    var itemIndex = 0;
    if (eleClass === "map-item") {
      itemIndex = ele.getAttribute('data-key');
    } else if (eleClass === "map-item-mark" || eleClass === "map-item-main") {
      itemIndex = ele.parentNode
        .getAttribute('data-key');
    } else if (!eleClass) {
      itemIndex = ele.parentNode
        .parentNode
        .parentNode
        .getAttribute('data-key');
    } else {
      itemIndex = ele.parentNode
        .parentNode
        .getAttribute('data-key');
    }
    this.showInfoWindow(itemIndex);
  },
  render: function() {
    var mapItemActieStyle = {
      backgroundColor: "#F0F0F0"
    };
    return (
      React.createElement("div", {className: "address-map", style: {
        display: this.props.addressKeyword
          ? "block"
          : "none"
      }}, 
        React.createElement("div", {className: "map-nav"}, 
          React.createElement("div", {className: "map-nav-title"}, 
            "附近有", 
            React.createElement("span", {className: "map-nav-number"}, 
              this.state.itemsNumber
            ), 
            "家体验店"
          ), 
          React.createElement("ul", {className: "map-items", id: "_addressMapItems", onClick: this.clickMapItem}, 
            this
              .state
              .itemsList
              .map(function (item, i) {
                return React.createElement("li", {className: "map-item", "data-key": i, key: i, style: (i === this.state.itemActive)
                    ? mapItemActieStyle
                    :
                      {}}, 
                    React.createElement("span", {className: "map-item-mark", style: (i === this.state.itemActive) ? {backgroundColor: "#1bbc9b"} : {}}, String.fromCharCode(65 + i)), 
                    React.createElement("div", {className: "map-item-main"}, 
                      React.createElement("div", {className: "map-item-title"}, item.title), 
                      React.createElement("div", {className: "map-item-address"}, "地址：", item.address), 
                      React.createElement("div", {className: "map-item-tel"}, "电话：", item.tel)
                    )
                  );
              }.bind(this))
          )
        ), 
        React.createElement("div", {className: "map-main", id: "_addressMapMain"})
      )
    );
  }
});



'use strict'

//  ==================================================
//  Component: ProgressBar
//
//  Include: Spinner
//
//  Description: Jsx for ProgressBar
//
//  TODO: [fix] 修正初始时 transition 不生效的问题
//  ==================================================

/* Spinner */
var Spinner = React.createClass({displayName: "Spinner",
  render: function() {
    return (
      React.createElement("div", {className: "cu-spinner"})
    );
  }
});

/* ProgressBar */
var ProgressBar = React.createClass({displayName: "ProgressBar",
  getInitialState: function() {
    return {
      rate: null,
      done: false
    };
  },
  getDefaultProps: function() {
    return {
      speed: 0.6,  // 动画速度
      spinner: true,  // 是否有圈圈
      easing: 'ease',  // 动画缓动曲线
      maxRate: 0.96,  // 进度条最大宽度
      incStep: 0.04,  // inc 增长步幅
      minStep: 0.005,  // 随机增长的最小步幅
      maxStep: 0.03,  // 随机增长的最大步幅
      trickle: true,  // 是否自动增长
      trickleSpeed: 800,  // 自动增长的间隔时间
      setTrickle: false  // set 后是否自动增长（未启用）
    };
  },
  start: function() {
    this._init();
    this.set('0.5%');
    this.props.trickle && this._autoInc();
  },
  set: function(n, trickle) {
    !trickle && this._init();
    n = this._format(n);
    if (n === 100) {
      /* done */
      this.setState({
        rate: 100
      });
    } else {
      n = n > this.props.maxRate * 100
        ? this.props.maxRate * 100
        : n;
      this.setState({
        rate: n
      });
    }
  },
  inc: function(n) {
    this._init();
    this.props.trickle && this._autoInc();
    n = n
      ? this._format(n)
      : this.props.incStep * 100;
    var newRate = this.state.rate + n;
    this.set(newRate + '%', true);
  },
  done: function() {
    this.set('100%');
    setTimeout(function() {
      this.setState({
        done: true
      });
      setTimeout(function() {
        this.setState({
          rate: null
        });
      }.bind(this), this.props.speed * 2 * 1000);
    }.bind(this), this.props.speed * 1000);
  },
  _format: function(data) {  // 格式化为 0-100 的整数
    if (typeof data === 'number') {  // 0-1 的小数
      return data > 1
        ? this.pros.maxRate * 100
        : data * 100;
    } else if (typeof data === 'string') {  // 百分比
      return parseFloat(data) > 100
        ? this.props.maxRate * 100
        : parseFloat(data);
    } else {
      return;
    }
  },
  _init: function() {
    this.state.done && this.setState({
      done: false
    });
    this.timer && this._clearInterval();
  },
  _autoInc: function() {
    var newRate;
    var random;
    this.timer = setInterval(function() {
      random = this._getRadomStep();
      newRate = this.state.rate + random;
      console.log(random);
      if (newRate > this.props.maxRate * 100) {
        console.log(this.props.maxRate * 100);
        this._clearInterval();
        return;
      }
      console.log(newRate);
      this.set(newRate + '%', true);
    }.bind(this), this.props.trickleSpeed);
  },
  _clearInterval: function() {
    this.timer && clearInterval(this.timer);
  },
  _getRadomStep: function(min, max) {
    min = min || this.props.minStep * 100;
    max = max || this.props.maxStep * 100;
    return Math.random() * (max - min) + min;
  },
  render: function() {
    var progressStyle = {
      //display: (!this.state.rate && typeof this.state.rate === 'object') ? 'none' : 'block',
      opacity: this.state.done
        ? 0
        : 1,
      transition: 'opacity ' + this.props.speed * 2 + 's ' + this.props.easing
    };
    var barStyle = {
      width: !this.state.rate
        ? 0
        : this.state.rate + '%',
      transition: 'width ' + this.props.speed + 's ' + this.props.easing
    };
    return this.state.rate
      ? (
        React.createElement("div", {className: "cu-progress", style: progressStyle}, 
          React.createElement("div", {className: "cu-progress-bar", style: barStyle}), 
          this.props.spinner
            ? React.createElement(Spinner, null)
            : null
        )
      )
      : null;
  }
});

var ToolTip = React.createClass({displayName: "ToolTip",
    getDefaultProps: function() {
        return {
            tip: "tip",
            trigger: 'hover',
            delay: 0,
            hoverable: false,
            position: "tip",
            width: "200px",
            type: 'span',
            aHref: "#"
        };
    },
    getInitialState: function() {
        return {
            position: this.props.position,
            isActive: false,
            isOnTip: false,
            tipHeight: ""
        };
    },
    handleMouseOver: function(e) {
        if(this.props.trigger=="hover") {
            this.setState({isActive: true});
        }
    },
    handleMouseOut: function(e) {
        if(this.props.trigger=="hover") {
            setTimeout(function() {
                if(this.state.isOnTip) {
                    return false;
                }
                this.setState({isActive: false});
            }.bind(this) , this.props.delay);
        }
    },
    handleClick: function(e) {
        if(this.props.trigger=="click") {
            if(this.state.isActive) {
                this.setState({isActive: false});
            } else if(!this.state.isActive) {
                this.setState({isActive: true});
            }
        }
    },
    handleTipMouseOver: function(e) {
        if(this.props.hoverable) {
            this.setState({isOnTip: true});
            this.setState({isActive: true});
        }
    },
    handleTipMouseOut: function(e) {
        if(this.props.hoverable) {
            this.setState({isOnTip: false});
            this.setState({isActive: false});
        }
    },
    componentDidUpdate: function() {
        this.setTipPosition();
    },
    setTipPosition: function() {
        var tip = this.refs.tip.getDOMNode();
        var cont = this.refs.cont.getDOMNode();
        if(!this.flag) {
            this.state.tipHeight = tip.offsetHeight;
            this.flag = 1;
        }
        var tipWidth = tip.offsetWidth;
        var tipHeight = tip.offsetHeight;
        var contWidth = cont.offsetWidth;
        var contHeight = cont.offsetHeight;
        switch (this.state.position) {
            case "left":tip.style.top = -(tipHeight-contHeight)/2+"px";
                        tip.style.left = -(tipWidth+20)+"px";
                break;
            case "right":tip.style.top = -(tipHeight-contHeight)/2+"px";
                        tip.style.left = "100%";
                break;
            case "top":tip.style.left = -(tipWidth-contWidth)/2+"px";
                        tip.style.bottom = "100%";
                break;
            case "bottom":tip.style.left = -(tipWidth-contWidth)/2+"px";
                        tip.style.top = "100%";
                break;
            default: tip.style.top = -(tipHeight-contHeight)/2+"px";
                    tip.style.left = -(tipWidth+20)+"px";
        }
        tip.style.height = this.state.tipHeight-20+"px";
        this.prevertTipOverflow();
    },
    prevertTipOverflow: function() {
        var tipX = this.refs.tip.getDOMNode().getBoundingClientRect().left;
        var tipY = this.refs.tip.getDOMNode().getBoundingClientRect().top;
        var tipWidth = this.refs.tip.getDOMNode().offsetWidth;
        var tipHeight = this.refs.tip.getDOMNode().offsetHeight;
        var availWidth = parseInt(document.body.clientWidth);
        if(tipX < 0 && tipX+tipWidth > availWidth) {
            return true;
        }
        if(tipX < 0) {
            if(this.state.position == "left") {
                this.setState({position: "top"});
                return ;
            }
            if(this.state.position == "top" || this.state.position == "bottom") {
                this.setState({position: "right"});
                return ;
            }
        }
        if(tipX+tipWidth > availWidth) {
            if(this.state.position == "right") {
                this.setState({position: "bottom"});
                return ;
            }
            if(this.state.position == "bottom" || this.state.position == "top") {
                this.setState({position: "left"});
                return ;
            }
        }

    },
    getTipStyle: function() {
        return {
            display: this.state.isActive?"block":"none",
            color: "pink",
            backgroundColor: "#333",
            width: this.props.width,
        };
    },
    render: function() {
        if(this.props.type=="span") {
            return (
                React.createElement("span", {className: "tooltip "+this.state.position}, 
                    React.createElement("span", {ref: "cont", onMouseOver: this.handleMouseOver, onMouseOut: this.handleMouseOut, onClick: this.handleClick}, this.props.children), 
                    React.createElement("div", {onMouseOver: this.handleTipMouseOver, onMouseOut: this.handleTipMouseOut, className: "tip", ref: "tip", style: this.getTipStyle()}, this.props.tip)
                )
            );
        }
        if(this.props.type=="a") {
            return (
                React.createElement("span", {className: "tooltip "+this.state.position}, 
                    React.createElement("a", {href: this.props.aHref, ref: "cont", onMouseOver: this.handleMouseOver, onMouseOut: this.handleMouseOut, onClick: this.handleClick}, this.props.children), 
                    React.createElement("div", {onMouseOver: this.handleTipMouseOver, onMouseOut: this.handleTipMouseOut, className: "tip", ref: "tip", style: this.getTipStyle()}, this.props.tip)
                )
            );
        }
        if(this.props.type=="button") {
            return (
                React.createElement("span", {className: "tooltip "+this.state.position}, 
                    React.createElement("button", {ref: "cont", onMouseOver: this.handleMouseOver, onMouseOut: this.handleMouseOut, onClick: this.handleClick}, this.props.children), 
                    React.createElement("div", {onMouseOver: this.handleTipMouseOver, onMouseOut: this.handleTipMouseOut, className: "tip", ref: "tip", style: this.getTipStyle()}, this.props.tip)
                )
            );
        }
    }
});
