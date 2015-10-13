var CompareBar = React.createClass({
	getInitialState: function () {
		return {
			itemData: [

			],
		};
	},
	getData: function(gurl , n) {
		$.ajax({
			url: gurl,
			dataType: "json",
			success: function(data) {
				var cantData = [];
				cantData[1-n] = this.state.itemData[1-n];
				cantData[n] = {};
				cantData[n].data = data;
				console.log(this.state.itemData);
				this.setState({
					itemData: [],
				});
		console.log(3);

				console.log(this.state.itemData);
			}.bind(this),
			error: function(xhr, status, err) {
		        console.error(gurl, status, err.toString());
		    }.bind(this)
		});
	},
	deleteItem: function(id) {
		alert(id+"0");
	},
	addItem: function(id) {
		var n = this.state.itemData.length;
		var cantData = [];
		cantData[1-n] = this.state.itemData[1-n];
		cantData[n] = {};
		cantData[n].id = id;
		this.setState({
			itemData: cantData,
		});
		var getUrl1 = "/item/" + id + "?format=json";
		console.log(2);
		this.getData(getUrl1, n);
	},
	componentWillMount: function() {
		var itemId =[];
		itemId[0] = 1;
		this.addItem(1);
		console.log(1);
	},
	render: function () {
		return (
            <div className="compare-bar">
                <a href="/compare" target="_blank">对比</a>

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
			contNodes[1] = <div className="tip-to-add all-no">您还可以继续添加要对比的商品</div>;
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
