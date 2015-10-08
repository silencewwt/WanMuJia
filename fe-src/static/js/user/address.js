var itemId = getValueFromLoc('item_id');
var keyword = getCookie('searchKeyword');

var addressPickerActiveStyle = {
  top: 225,
  left: "38%"
};

var addressPicker = React.render(
  <AddressPicker addressPickerActiveStyle={addressPickerActiveStyle} keyword={keyword} addressData={addressData} theme="dark" />,
  document.getElementById('address-picker')
);

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
