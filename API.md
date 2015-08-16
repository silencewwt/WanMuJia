#WanMuJia API Doc

##User
###user register
+ **URL**
  + /register
+ **method**
  + GET
  + POST
+ **postData**

###user login
+ **URL**
  + /login
+ **method**
  + GET
  + POST
+ **postData**
  + csrf_token
  + username
  + password

###user logout
+ **URL**
  + /logout
+ **method**
  + GET

###reset password
+ **URL**
  + /reset_password
+ **method**
  + GET
  + POST

###user home page
+ **URL**
  + /profile
+ **method**
  + GET

###user collection
+ **URL**
  + /collection
+ **method**
  + GET
  + POST
  + DELETE
+ **parameters**
  + page
  + item
+ **no postData**

###user setting
+ **URL**
  + /setting
+ **method**
  + GET
  + POST


##Item
###item list
+ **URL**
  + /item
+ **method**
  + GET

###item filter
+ **URL**:
  +	/item/filter
+ **method**:
  + POST
+ **parameters**:
  +	page
  +	brand

###item compare
+ **URL**
  + /item/compare
+ **method**
  + GET
+ **parameters**
  + first
  + second

###item detail
+ **URL**
  + /item/<int: id> 
+ **method**
  + GET


##Distributor
###distributor register
+ **URL**
  + /distributor/register
+ **method**
  + GET
  + POST
+ **postData**
  + **name** 
    + 商家名称
    + type=text
    + required
  + **password**
    + 密码
    + type=password
    + required
  + **confirmed_password**
    + 确认密码
    + type=password
    + required
  + **contact**
    + 联系人姓名
    + type=text
    + required
  + **contact_mobile**
    + 联系人手机
    + type=text
    + required
  + **contact_telephone**
    + 固话
    + type=text
    + required
  + **district_cn_id**
    + 行政区号
    + select
    + required
  + **address**
    + 详细地址
    + type=text
    + required

        
##Vendor
###vendor register
+ **URL**
  + /vendor/register
+ **method**
  + GET, POST
+ **postData**   
  + **password**
    + 密码
    + type = text
    + required 
  + **confirm_password**
    + 确认密码
    + type = text
    + require  
  + **email**
    + 邮箱
    + type = text
    + required
  + **agent_name**
    + 代理人姓名
    + type = text
    + required
  + **agent_identity**
    + 代理人身份证号
    + type = text
    + required
  + **agent_identity_front**
    + 代理人身份证正面照片
    + type = img
    + required
  + **agent_identity_back**
    + 代理人身份证反面照片
    + type = img
    + required
  + **name**
    + 厂家名称
    + type = text
    + required
  + **license_limit**
    + 营业执照期限
    + type = text
    + required
  + **license_image**
    + 营业执照照片
    + type = img
    + required
  + **telephone**
    + 固话
    + type = text
    + required
  + **address**
    + 详细地址
    + type = text
    + required
  + **district_cn_id**
    + 区域的cn_id
    + type = text
    + required

###vendor login
+ **URL**
  + /vendor/login
+ **method**
  + GET
  + POST

###vendor logout
+ **URL**
  + /vendor/logout
+ **method**
  + GET
  + POST

###vendor reset password
+ **URL**
  + /vendor/reset_password
+ **method**
  + GET
  + POST

###vendor item list
+ **URL**
  + /vendor/items?page=&per_page
+ **method**
  + GET
+ **parameters**
  + page: list 
  + per_page: item numbers per page

###vendor add item
+ **URL**
  + /vendor/items
+ **method**
  + POST

###vendor item detail
+ **URL**
  + /vendor/items?item=
+ **method**
  + GET
+ **parameters**
  + item: item id

###vendor edit item
+ **URL**
  + /vendor/items/<int:id>
+ **method**
  + PUT
+ **parameters**
  + : item id

###vendor delete item
+ **URL**
  + /vendor/items?item=
+ **method**
  + DELETE
+ **parameters**
  + item: item id
  + Item Form
	+ item: 
	  + 商品名称
	  +  require
	  + length: [1, 20]
	+ length
	  + 商品长度(cm)
	  + require
	+ width
	  + 商品宽度(cm)
	  + require
	+ height
	  + 商品高度(cm)
	  + require
	+ price
	  + 指导价格(元)
	  + require
	+ material_id
	  + 二级材料id
	  + require
	+ second_category_id
      + 二级分类id
	  + require
	+ stove_id	
	  + 烘干工艺id
	  + require
	+ carve_id
	  + 雕刻工艺id
	  + require
	+ sand_id
	  + 打磨砂纸id
	  + require
	+ paint_id
	  + 涂饰工艺id
	  + require
	+ decoration_id
	  + 装饰工艺id
	  + require
	+ tenon_id
	  + 榫卯结构id
	  + require
	+ story
	  + 商品寓意
	  + length: [0, 5000]
    
###vendor distributors
+ **URL**
  + /vendor/distributors
+ **method**
  + GET

###vendor distributor detail
+ **URL**
  + /vendor/distributors/<distributor_id>
+ **method**
  + GET

###vendor distributor invitation
+ **URL**
  + /vendor/distributors/invitation
+ **method**
  + GET, POST

###vendor distributors revocation
+ **URL**
  + /distributors/<int:distributor_id>/revocation
+ **method**
  + POST
    
###vendor settings
+ **URL**
  + /vendor/settings
+ **method**
  + GET
  + POST

###vendor reconfirm
+ **URL**
  + /vendor/reconfirm
+ **method**
  + GET
  + POST


##privilege

###login
+ **URL**
  + /privilege/login
+ **method**
  + GET, POST
+ **postData**
  + username
  + password
    
###vendor_confirm
+ **URL**
  + /privilege/vendor_confirm
+ **method**
  + GET
    
###vendor_confirm reject
+ **URL**
  + /privilege/vendor_confirm/reject
+ **method**
  + POST
+ **postData**
  + vendor_id
  + reject_message
    
###vendor_confirm pass
+ **URL**
  + /privilege/vendor_confirm/pass
+ **method**
  + POST
+ **postData**
  + vendor_id
    
###distributors revocation
+ **URL**
  + /privilege/distributors/revocation
+ **method**
  + GET
  + POST
+ **postData**
  + distributor_revocation_id
  + revocation_confirm
