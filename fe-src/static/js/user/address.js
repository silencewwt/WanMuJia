var itemId = getValueFromLoc('item_id');
var keyword = getCookie('searchKeyword');

var addressPickerActiveStyle = {
  top: 225,
  left: "38%"
};

var disFilter = {
  "distributors": [1, 99, 100, 103]
};

var lbsOption = {
  ak: 'sdp9qCbToS7E23nDRxaAAwbh',
  geotableId: 121763,
  radius: 10000,
  tags: '',
  sortby: '',
  filter: ''
};

$.get('/service/cities', function(city) {
  $.get('/item/'+ itemId +'/distributors', function(dis) {
    lbsOption.filter = 'distributor_id:' + getMapFilter(dis.distributors);
    React.render(
      <AddressPicker addressPickerActiveStyle={addressPickerActiveStyle} keyword={keyword} addressData={city} theme="dark" lbs={lbsOption} />,
      document.getElementById('address-picker')
    );
  });
});


function getValueFromLoc(key){
  var search = location.search.slice(1);
  var values = search.split('&');
  var result = {};
  var tem;
  for(var i in values) {
    tem = values[i].split('=');
    result[tem[0]] = tem[1];
  }
  return result[key];
}

function getMapFilter(dis) {
  return '[' + dis.join(',') + ']';
}
