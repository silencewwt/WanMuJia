// {itemData: [
// 	{
// 		id: 1,
// 		data: {
// 			item: "九龙堂长椅",
// 			price: 10000,
// 			image_url: /img/1.jpg
// 		}
// 	}
// ]}

var CompareBar = React.createClass({
	getInitialState: function () {
		return {
			itemData: [

			],
			addResult: null,
		};
	},
	// get & set data , need id & num
	getData: function(id) {
		// 获取data接口
		var getUrl = "/item/" + id + "?format=json";
		// ajax请求
		$.ajax({
			url: getUrl,
			dataType: "json",
			success: function(data) {
				// 预处理之前已存在的data
				var cantData = [];
				// 如果已存在一个data
				if(this.state.itemData.length == 1) {
					cantData[0] = this.state.itemData[0];
					// 添加新增数据
					cantData[1] = {
						id: id,
						data: data
					};
				}
				cantData[0] = {
					id: id,
					data: data
				};
				this.setState({
					itemData: cantData,
				});
			}.bind(this),
			error: function(xhr, status, err) {
		        console.error(getUrl, status, err.toString());
		    }.bind(this)
		});
	},
	deleteItem: function(id) {
		// delete cookie
		this.props.setCompareItem.deleteItem(id);
		// delete item data state
		if(this.state.itemData.length == 1 && this.state.itemData[0].id == id) {
			this.setState({itemData: []});
		} else if(this.state.itemData.length == 2) {
			var cantData = [];
			if(this.state.itemData[0].id == id) {
				cantData[0] = this.state.itemData[1];
				this.setState({itemData: cantData});
			} else if(this.state.itemData[1].id == id) {
				cantData[0] = this.state.itemData[0];
				this.setState({itemData: cantData});
			}
		}
	},
	// add data , need id
	addItem: function(id) {
		// set cookie and get result
		var result = this.props.setCompareItem.addItem(id);
		this.setState({addResult: result});
		// todo: show result
		// ...................................
		if(!result.success) {
			return ;
		}
		this.getData(id);
	},
	componentWillMount: function() {
		// get cookie
		var idGroup = this.props.setCompareItem.getItem(id);
		// add item
		for(var i = 0; i < idGroup.length; i++) {
			this.getData(idGroup[i]);
		}
	},
	render: function () {
		return (
            <div className="compare-bar">
                <a href="/compare" target="_blank">对比</a>

				{
					this.state.itemData.length?
					<span className="compare-num">{this.state.itemData.length}</span>:
					null
				}

                <CompareBarCont itemData={this.state.itemData} deleteItem={this.deleteItem} />

            </div>
		);
	}
});

var CompareBarCont = React.createClass({
    render: function() {
		var contNodes = [];
		var itemData = this.props.itemData;
		if(itemData.length === 0) {
			contNodes[0] = <div className="tip-to-add all-no">当前没有可以对比的选项，您可以到商品详情页添加要对比的商品</div>;
		} else if(itemData.length == 1) {
			contNodes[0] = <CompareBarItem data={itemData[0]} deleteItem={this.props.deleteItem}/>;
			contNodes[1] = <div className="tip-to-add">您还可以继续添加要对比的商品</div>;
		} else if(itemData.length == 2) {
			contNodes[0] = <CompareBarItem data={itemData[0]} deleteItem={this.props.deleteItem}/>;
			contNodes[1] = <CompareBarItem data={itemData[1]} deleteItem={this.props.deleteItem}/>;
		}
        return (
            <div className="compare-bar-cont">
                {contNodes}
            </div>
        );
    }
});

var CompareBarItem = React.createClass({
	handleDelClick: function() {
		this.props.deleteItem(this.props.data.id);
	},
    render: function() {
        return (
            <div className="compare-bar-item">
                <img alt={this.props.data.data.item} src={this.props.data.data.image_url}/>
                <div>
                    <h2>{this.props.data.data.item}</h2>
                    <div>{"¥" + this.props.data.data.price}</div>
                </div>
				<span onClick={this.handleDelClick}>删除</span>
            </div>
        );
    }
});
 






var CompareBarCom = React.render(<CompareBar setCompareItem={setCompareItem}/> , document.getElementById("compareBar"));
