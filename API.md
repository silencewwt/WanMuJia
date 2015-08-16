#WanMuJia API Doc

## User

###user register
    URL:
        /register
    method:
        GET, POST

###user login
    URL:
        /login
    method:
        GET, POST

###user logout
    URL:
        /logout
    method:
        GET

###reset password
    URL:
        /reset_password
    method:
        GET, POST

###user home page
    URL:
        /profile
    method:
        GET, POST

###user collection
    URL:
        /collection
    method:
        GET, POST, DELETE
    parameters:
        page, item

###user setting
    URL:
        /setting
    method:
        GET, POST


## Distributor
### distributor register
	URL:
		/distributor/register
	method:
		GET, POST

postData:
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

        
## Vendor

###vendor register
    URL:
        /vendor/register
    method:
        GET, POST
postData:
 + **password**
  + 密码
  + type = text
  + required
 + **confirm_password**
  + 确认密码
  + type = text
  + required
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
    URL:
        /vendor/login
    method:
        GET, POST

###vendor logout
    URL:
        /vendor/logout
    method:
        GET, POST

###vendor reset password
    URL:
        /vendor/reset_password
    method:
        GET, POST

###vendor items list
+	item list
	+	URL:
	
			/vendor/items?page=&per_page
	+    method:
			
			GET
    +	parameters:
			
			page: list 
			per_page: item numbers per page
+	add item
	+	URL:
	
			/vendor/items
	+	method:
	
			POST
+	item detail
	+	URL:
		
			/vendor/items?item=
	+	method:
	
			GET
	+	parameters:
	
			item: item id
+	edit item
	+	URL:
	
			/vendor/items?item=
	+	method:
	
			PUT
	+	parameters:
	
			item: item id
+	delete item
	+	URL:
	
			/vendor/items?item=
	+	method:
	
			DELETE
	+	parameters:
	
			item: item id
+	Item Form
	+	item: 
		
			商品名称
			Required
			length: [1, 20]
	+	length
			
			商品长度(cm)
			Required
	+	width
			
			商品宽度(cm)
			Required
	+	height
			
			商品高度(cm)
			Required
	+	price
			
			指导价格(元)
			Required
	+	material_id
			
			二级材料id
			SelectField
			Required
	+	second_category_id

			二级分类id
			SelectField
			Required
	+	stove_id
			
			烘干工艺id
			SelectField
			Required
	+	carve_id
			
			雕刻工艺id
			SelectField
			Required
	+	sand_id
	
			打磨砂纸id
			SelectField
			Required
	+	paint_id
			
			涂饰工艺id
			SelectField
			Required
	+	decoration_id
	
			装饰工艺id
			SelectField
			Required
	+	tenon_id
			
			榫卯结构id
			SelectMultipleField
			Required
	+	story
			
			商品寓意
			TextAreaField
			length: [0, 5000]
    
###vendor distributors
    URL:
        /vendor/distributors
    method:
        GET

##vendor distributors detail
    URL:
        /vendor/distributors/<distributor_id>
    method:
        GET

##vendor distributors invitation
    URL:
        /vendor/distributors/invitation
    method:
        GET, POST

##vendor distributors revocation
    URL:
        /distributors/<distributor_id>/revocation
    method:
        POST
    
###vendor settings
    URL:
        /vendor/settings
    method:
        GET, POST
    
###vendor reconfirm
    URL:
        /vendor/reconfirm
    method:
        GET, POST
    
##item

###item list
    URL:
        /item
    method:
        GET, POST
    parameters:
        id, page

###item detail
    URL:
        /item/detail
    method:
        GET
    parameters:
        id

###item filter
    URL:
        /item/filter
    method:
        GET
    parameters:
        page
    
###item compare
    URL:
        /item/compare
    method:
        GET
    parameters:
        first, second
        
##privilege

###login
    URL:
        /privilege/login
    method:
        GET, POST
    form:
        username
        password
    
###vendor_confirm
    URL:
        /privilege/vendor_confirm
    method:
        GET
    
###vendor_confirm reject
    URL:
        /privilege/vendor_confirm/reject
    method:
        POST
    form:
        vendor_id
        reject_message
    
###vendor_confirm pass
    URL:
        /privilege/vendor_confirm/pass
    method:
        POST
    form:
        vendor_id
    
###distributors revocation
    URL:
        /privilege/distributors/revocation
    method:
        GET, POST
    form:
        distributor_revocation_id
        revocation_confirm
    
