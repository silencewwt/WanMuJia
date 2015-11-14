'use strict';

require("./CityPickerWithTab.scss");

let React = require("react");
let addressData = require("../../../../assets/data/addressData.json");
let cookieOperation = require("../../../utils/cookie.js");

var CityPickerWithTab = React.createClass({
  getInitialState: function() {
    return {
      active: false,
      nowAddress: {
        provinceId: "110000",
        province: "北京",
        cityId: "110100",
        city: "北京市"
      },
    };
  },
  // ---------------- 点击组件外部组件隐藏 begin ------------------
  handleClick: function(e) {
    if (this.getDOMNode().contains(e.target)) {
      return ;
    }
    this.setState({active: false});
  },
  componentDidMount: function() {
    document.addEventListener('mousedown', this.handleClick, false);

    // TODO:
    // 获取cookie、如果没有、定位城市，如果存在，储存id,更新 state,调用回调
    var cityId = cookieOperation.getCookie(cityId);
    // this.setState({
    //     nowAddress: {province: "陕西", city: "西安市"},
    // });
  },
  componentWillUnmount: function () {
    document.removeEventListener('mousedown', this.handleClick, false);
  },
  // ---------------- 点击组件外部组件隐藏 end ------------------
  selectCity: function(province, provinceId, city, cityId) {
    var address = {
      province: province,
      city: city,
      provinceId: provinceId,
      cityId: cityId
    };
    this.setState({nowAddress: address});
    this.toggle();
    // 储存cookie
    cookieOperation.setCookie(address, address, 30, "/");
    // 回调
    // ..........this.props.callback(...,...,...,...);
  },
  // 显示/隐藏列表
  toggle: function() {
    this.setState({active: !this.state.active});
  },
  render: function() {
    return (
      <div className="city-picker-wt">
        <CityPickerBtn
          toggle={this.toggle}
          active={this.state.active}>
          {this.state.nowAddress}
        </CityPickerBtn>
        {
          this.state.active?
            <CityPickerGroup
              toggle={this.toggle}
              selectCity={this.selectCity}
              data={addressData}
              nowAddress={this.state.nowAddress} />
            :
            null
        }
      </div>
    );
  }
});

var CityPickerBtn = React.createClass({
  render: function() {
    return (
      <span
        onClick={this.props.toggle}
        className={(this.props.active?"active ":" ")+"city-picker-btn after-i"}>
        {this.props.children.city}
      </span>
    );
  }
});

var CityPickerGroup = React.createClass({
  render: function() {
    return (
      <div className="city-picker-group">

        <CityPickerClose toggle={this.props.toggle} />

        <CityPickerCont
          selectCity={this.props.selectCity}
          nowAddress={this.props.nowAddress}
          data={this.props.data}  />

      </div>
    );
  }
});

var CityPickerClose = React.createClass({
  render: function() {
    return (
      <span onClick={this.props.toggle} className="city-picker-close">+</span>
    );
  }
});

var CityPickerCont = React.createClass({
  getInitialState: function() {
    return {
      tabStatus: 0,
      province: null,
      provinceData: null,
      city: null,
      cityData: null
    };
  },
  // 组件在挂载的时候遍历省份数据改变状态－－省份数据
  componentWillMount: function() {
    let data = this.props.data;
    let provinceData = [];
    let i = 0;
    for(var id in data) {
      provinceData[i] = {
        id: id,
        name: data[id].name
      };
      // 筛选出但前选择的城市
      if(data[id].name == this.props.nowAddress.province) {
        this.setState({province: provinceData[i]});
        // 初始化当前城市列表
        this.initCityData(id);
      }
      i++;
    }
    this.setState({provinceData: provinceData});
  },
  // 传入省份id，是否改变城市：初始化当前城市列表false，改变省份是true，true-改变当前城市状态
  initCityData: function(provinceId, isChange) {
    let data = this.props.data[provinceId].cell;
    let cityData = [];
    let i = 0;
    for(var id in data) {
      cityData[i] = {
        id: id,
        name: data[id].name
      };
      i++;
    }
    if(isChange) {
      this.setState({
        cityData: cityData,
        city: {
          name: cityData[0].name,
          id:cityData[0].id
        }
      });
    }
    this.setState({cityData: cityData});
  },
  // tab点击
  tabClick: function(tabStatus) {
    if(tabStatus == this.state.tabStatus) {
      return ;
    }
    this.setState({tabStatus: !this.state.tabStatus});
  },
  // 点击省份或者城市 item 时的回调函数
  itemClick: function(data) {
    // 点击省份 item，改变tab到城市，改变城市列表与之对应
    if(!this.state.tabStatus) {
      this.setState({tabStatus: !this.state.tabStatus, province: data});
      this.initCityData(data.id, true);
      return ;
    }
    // 点击城市 item，回调选择城市 函数
    this.props.selectCity(this.state.province.name, this.state.province.id, data.name, data.id);
  },
  render: function() {
    // nowAddress 是但前组件的address状态
    var nowAddress = {};
    nowAddress.city = this.state.city?
                      this.state.city.name:
                      this.props.nowAddress.city;
    nowAddress.province = this.state.province?
                          this.state.province.name:
                          this.props.nowAddress.province;
    return (
      <div className="city-picker-cont">

        <CityPickerTab
            tabClick={this.tabClick}
            nowAddress={nowAddress}
            status={this.state.tabStatus}
        />

        <CityPickerList
          itemClick={this.itemClick} data={this.state.tabStatus?this.state.cityData:this.state.provinceData} province={nowAddress.province} />

      </div>
    );
  }
});


var CityPickerList = React.createClass({
  handleClick: function(data) {
    this.props.itemClick(data);
  },
  render: function() {
    let listNodes = this.props.data.map(function(data, idx) {
      return (
        <li key={idx}>
          <span
            onClick={this.handleClick.bind(this,data)} className={(this.props.province==data.name?"active":"") + " item"} >
            {data.name}
          </span>
        </li>
      );
    }.bind(this));
    return (
      <ul className="city-picker-list">
        {listNodes}
      </ul>
    );
  }
});

var CityPickerTab = React.createClass({
  handleClick: function(status) {
    this.props.tabClick(status);
  },
  render: function() {
    return (
      <div className="city-picker-tab">

        <span
          onClick={this.handleClick.bind(this,0)} className={(!this.props.status?"active ":"")+"tab-btn after-i"}>
          {this.props.nowAddress.province}
        </span>

        <span
          onClick={this.handleClick.bind(this,1)} className={(this.props.status?"active ":"") + "tab-btn after-i"}>
          {this.props.nowAddress.city}
        </span>

      </div>
    );
  }
});

module.exports = CityPickerWithTab;
