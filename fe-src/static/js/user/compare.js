var Compare = React.createClass({
    getInitialState: function() {
        return {
            firstData: null,
            secondData: null,
			firstID: null,
			secondID: null,
        };
    },
	getData: function(gurl , settedData) {
		$.ajax({
			url: gurl,
			dataType: "json",
			success: function(data) {
				if(settedData == "firstData") {
					this.setState({
			            firstData: data,
			        });
				} else if (settedData == "secondData") {
					this.setState({
			            secondData: data,
			        });
				}
			}.bind(this),
			error: function(xhr, status, err) {
		        console.error(gurl, status, err.toString());
		    }.bind(this)
		});
	},
    componentDidMount: function() {
		// 从 cookie 获取 商品 id ,
        var itemId = this.props.setCompareItem.getItem();
        if(itemId[0]) {
		    this.setState({firstID: itemId[0]});
		    var getUrl1 = "/item/" + itemId[0] + "?format=json";
		    this.getData(getUrl1, "firstData");
        }
        if(itemId[1]) {
    		this.setState({secondID: itemId[1]});
    		var getUrl2 = "/item/" + itemId[1] + "?format=json";
    		this.getData(getUrl2, "secondData");
        }
    },
    deleteItem: function(w) {
		// 清除 cookie,清除组件内数据
		if(w == "first") {
            this.props.setCompareItem.deleteItem(this.state.firstID);
            this.props.CompareBarDel(this.state.firstID);
			this.setState({firstData: null});
			this.setState({firstID: null});
		} else if(w == "second") {
            this.props.setCompareItem.deleteItem(this.state.secondID);
            this.props.CompareBarDel(this.state.secondID);
			this.setState({secondData: null});
			this.setState({secondID: null});
		}
    },
    render: function() {
        return (
            <div className="compare">
                <div className="wrapper-cmp">
                    <h3>产品对比</h3>
                    <CompareItembox deleteItem={this.deleteItem} firstImgSrc={this.state.firstData?this.state.firstData.image_url:null} secondImgSrc={this.state.secondData?this.state.secondData.image_url:null} firstID={this.state.firstID} secondID={this.state.secondID}/>
                    {
                        this.state.firstData&&this.state.secondData?
                        <CompareTable firstData={this.state.firstData} secondData={this.state.secondData} />:
                        null
                    }
                </div>
            </div>
        );
    }
});

var CompareItembox = React.createClass({
    render: function() {
        return (
            <div className="compare-img clearfix">
                <CompareItem deleteItem={this.props.deleteItem} pos="first" imgSrc={this.props.firstImgSrc} aHref={this.props.firstID} />
                <CompareItem deleteItem={this.props.deleteItem} pos="second" imgSrc={this.props.secondImgSrc} aHref={this.props.secondID} />
            </div>
        );
    }
});

var CompareItem = React.createClass({
    handleDeleteClick: function() {
        this.props.deleteItem(this.props.pos);
    },
    render: function() {
        return (
            <div className={this.props.pos}>
                {this.props.aHref?
                    <a href={"/item/"+this.props.aHref}><img src={this.props.imgSrc} alt="" /></a>:
                    <span className="add-compare"><a href="/item" className="add-compare-btn">+</a></span>
                }
                {this.props.aHref?
                    <span className="delete-compare-btn" onClick={this.handleDeleteClick}>删除</span>:
                    null
                }
            </div>
        );
    }
});

var CompareTable = React.createClass({
    render: function() {
        return (
            <table className="compare-params">
                <tbody>
                    <CompareTableItem first={this.props.firstData.item} second={this.props.secondData.item}>商品名称</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.size} second={this.props.secondData.size}>商品尺寸</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.area} second={this.props.secondData.area}>适用面积</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.price} second={this.props.secondData.price}>指导价格</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.second_scene} second={this.props.secondData.second_scene}>场景分类</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.category} second={this.props.secondData.category}>商品种类</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.second_material} second={this.props.secondData.second_material}>商品材料</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.stove} second={this.props.secondData.stove}>烘干工艺</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.outside_sand} second={this.props.secondData.outside_sand}>外表面打磨砂纸</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.inside_sand} second={this.props.secondData.inside_sand}>内表面打磨砂纸</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.carve} second={this.props.secondData.carve}>雕刻工艺</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.paint} second={this.props.secondData.paint}>涂饰工艺</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.decoration} second={this.props.secondData.decoration}>装饰工艺</CompareTableItem>
                    <CompareTableItem first={this.props.firstData.tenon} second={this.props.secondData.tenon}>榫卯结构</CompareTableItem>
                </tbody>
            </table>
        );
    }
});

var CompareTableItem = React.createClass({
	optionArrayItemDetail: function(item) {
		if(Object.prototype.toString.call(item) === '[object Array]') {
			if(item.length > 1) {
				for(var i = 0; i < item.length-1; i++) {
					item[i] += "、";
				}
			}
		}
		return item;
	},
    render: function() {
		var firstDetail = this.optionArrayItemDetail(this.props.first);
		var secondDetail = this.optionArrayItemDetail(this.props.second);
        return (
            <tr className="param">
                <td className="first">{firstDetail}</td>
                <td className="param-name">
					{this.props.children}
				</td>
                <td className="second">{secondDetail}</td>
            </tr>
        );
    }
});

var Compare = React.render(<Compare CompareBarDel={CompareBarCom.deleteItem} setCompareItem={setCompareItem}/>,document.getElementById('compare'));
