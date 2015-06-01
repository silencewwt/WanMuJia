#WanMuJia API Doc

##user

###user register
    URL:
        /user/register
    method:
        GET, POST

###user login
    URL:
        /user/login
    method:
        GET, POST


###user logout
    URL:
        /user/logout
    method:
        GET

###send sms
    注册时发送手机验证码, 成功返回200, 号码已被使用返回401 
    URL:
        /user/send_sms
    method:
        POST
    parameters:
        mobile
    return:
        若成功http状态码200, 否则401

###user email verify
    验证邮箱认证链接
    URL:
        /user/verify
    method:
        GET, POST

###reset password
    URL:
        /user/reset_password
    method:
        GET, POST

###user home page
    URL:
        /user/profile
    method:
        GET, POST

###user collection
    URL:
        /user/collection
    method:
        GET, POST, DELETE
    parameters:
        page, item

###user setting
    URL:
        /user/setting
    method:
        GET, POST
        
##vendor

###vendor register
    URL:
        /vendor/register
    method:
        GET, POST

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