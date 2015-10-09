# WanMuJia API Doc
## User
### user register
+ **URL**
  + /register
+ **method**
  + GET
  + POST
+ **postData**(手机注册)
  + **csrf_token**
  + **mobile**
    + 手机号码
    + type = text
    + length = 11
    + require
  + **captcha**
    + 短信验证码
    + type = text
    + length = 6
    + require
+ **postData**(邮箱注册)
  + 邮箱注册的API见 send email, 注意接口地址不是/register
  + **csrf_token**
  + **email**
    + 邮箱
    + type = text
    + length = [3, 64]
    + require

### user register next
+ **URL**
  + /register
+ **method**
  + GET
  + POST
+ **postData**
  + **csrf_token**
  + **password**
    + 密码
    + type = password
    + length = [6, 32]
    + require
    + 需将用户的密码md5两次
  + **confirm_password**
    + 确认密码
    + type = password
    + length = [6, 32]
    + require
    + 需将用户的密码md5两次, 且与password相等
  + **nickname**
    + 昵称
    + type = text
    + length = [4, 30]
    + require
+ **return**
  + 成功
    + `{"status": true}`
  + 失败
    + `{"status": false, "message": ""}`

### user login
+ **URL**
  + /login
+ **method**
  + GET
  + POST
+ **postData**
  + **csrf_token**
  + **username**
    + 用户名 (手机号码 或 邮箱)
    + type = text
    + require
  + **password**
	+ 密码
    + type = password
    + require
    + 需将用户密码md5两次
+ **return**
  + 成功
    + `{"status": true}`
  + 失败
    + `{"status": false, "message": ""}`
    
### user logout
+ **URL**
  + /logout
+ **method**
  + GET

### reset password
+ **URL**
  + /reset_password
+ **method**
  + GET
  + POST`

### user home page
+ **URL**
  + /profile
+ **method**
  + GET

### user collection
+ **URL**
  + /collection
+ **method**
  + GET
  + POST
  + DELETE
+ **parameters**
  + page
    + 页数, 从1开始, 仅GET方式需要
  + item: item id, 仅POST, DELETE方式需要
+ **return**
  + GET
    + `{"collections": [{"item": "", "price": "", "item_id": "", "deleted": "", "image_url": ""}], "amount": "", "page": "", "pages": ""}`
    + **amount**
      + 收藏总数
    + **page**
      + 当前页数
    + **pages**
      + 总页数
  + POST
    + `{"success": false, "message": "该商品不存在"}`
    + `{"success": true}`
  + DELETE
    + `{"success": true}`

### user setting
+ **URL**
  + /setting
+ **method**
  + GET
  + POST


## Item
### item list
+ **URL**
  + /item
+ **method**
  + GET

### item filter
+ **URL**
  +	/item/filter
+ **method**
  + POST
+ **parameters**
  +	page
  +	brand

### item compare
+ **URL**
  + /item/compare
+ **method**
  + GET

### item detail
+ **URL**
  + /item/\<int: id\>
+ **method**
  + GET
+ **parameters**
  + format
    + 如果format == json, 返回json, 否则为html
+ **return**
  + format == json
    + `{"item": "", "price": "", "second_material": "", "category": "", "second_scene": "", "outside_sand": "", "inside_sand": "", "size": "", "area": "", "stove": "", "carve": [""], "tenon": [""], "paint": "", "decoration": "", "story": "", "image_url": ""}`
    + **item**
      + 商品名称
    + **price**
      + 指导价格
    + **second_material**
      + 二级材料
    + **category**
      + 商品分类
    + **second_scene**
      + 二级场景分类
    + **outside_sand**
      + 外表面打磨砂纸
    + **inside_sand**
      + 内表面打磨砂纸
    + **size**
      + 长 * 宽 * 高
    + **area**
      + 适用面积
    + **stove**
      + 烘干工艺
    + **paint**
      + 涂饰工艺
    + **decoration**
      + 装饰工艺
    + **carve**
      + 雕刻工艺
    + **tenon**
      + 榫卯结构
    + **story**
      + 商品寓意
    + **image_url**
      + 图片url

### item distributors
+ **URL**
  + /item/\<int:item_id\>/distributors
+ **method**
  + GET
+ **return**
  + json
  + `{"distributors": [""]}`

## Distributor
### distributor register
+ **URL**
  + /distributor/register
+ **method**
  + GET
  + POST
+ **postData**
  + **name** 
    + 商家名称
    + type = text
    + required
  + **password**
    + 密码
    + type = password
    + required
  + **confirmed_password**
    + 确认密码
    + type = password
    + required
  + **contact**
    + 联系人姓名
    + type = text
    + required
  + **contact_mobile**
    + 联系人手机
    + type = text
    + required
  + **contact_telephone**
    + 固话
    + type = text
    + required
  + **district_cn_id**
    + 行政区号
    + select
    + required
  + **address**
    + 详细地址
    + type = text
    + required

        
## Vendor
### vendor register
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

### vendor login
+ **URL**
  + /vendor/login
+ **method**
  + GET
  + POST
+ **postData**
  + **mobile**
    + 手机号码
    + type = text
    + required
  + **password**
    + 密码
    + type = text
    + required
    + 需要md5两次

### vendor logout
+ **URL**
  + /vendor/logout
+ **method**
  + GET

### vendor reset password
+ **URL**
  + /vendor/reset_password
+ **method**
  + GET
  + POST
  
### vendor index
+ **URL**
  + /vendor
+ **method**
  + GET
  
### vendor item page
+ **URL**
  + /vendor/items
+ **method**
  + GET

### vendor items datatable
+ **URL**
  + /vendor/items?draw=&start=&length=
+ **method**
  + GET
+ **paramaters**
  + draw
  + start
  + length

### vendor add single item
+ **URL**
  + /vendor/items/new_item?type=single
+ **method**
  + GET, POST
+ **postData**
  + **item**
    + 商品名称
    + type = text
    + required
  + **length**
    + 商品长度
    + type = text
    + 商品长宽高与适用面积二选其一
    + 商品长宽高只能全部填写或全不填写
  + **width**
    + 商品宽度
    + type = text
  + **heigth**
    + 商品高度
    + type = text
  + **area**
    + 商品适用面积
    + type = text
    + 商品适用面积与长宽高二选其一
  + **price**
    + 商品指导价格
    + type = text
    + required
  + **second_material_id**
    + 商品二级材料id
    + type = text
    + required
  + **category_id**
    + 商品分类id
    + type = text
    + required
  + **stove_id**
    + 烘干工艺id
    + type = text
    + required
  + **carve_id**
    + 雕刻工艺id
    + type = text
    + required
  + **outside_sand_id**
    + 外表面打磨砂纸id
    + type = text
    + required
  + **inside_sand_id**
    + 内表面打磨砂纸id
    + type = text
  + **paint_id**
    + 涂饰工艺id
    + type = text
    + required
  + **decoration_id**
    + 装饰工艺id
    + type = text
    + required
  + **tenon_id**
    + 榫卯结构id
    + type = text
    + required
  + **story**
    + 商品寓意
    + type = text

### vendor add suite
+ **URL**
  + /vendor/items/new_item?type=suite
+ **method**
  + POST
+ **postData**
  + **item**
    + 套件名称
    + type = text
    + required
  + **area**
    + 商品适用面积
    + type = text
  + **price**
    + 商品指导价格
    + type = text
    + required
  + **second_material_id**
    + 商品二级材料id
    + type = text
    + required
  + **category_id**
    + 商品分类id
    + type = text
    + required
  + **second_scene_id**
    + 二级场景id
    + type = text
    + required
  + **stove_id**
    + 烘干工艺id
    + type = text
    + required
  + **carve_id**
    + 雕刻工艺id
    + type = text
    + required
  + **outside_sand_id**
    + 外表面打磨砂纸id
    + type = text
    + required
  + **inside_sand_id**
    + 内表面打磨砂纸id
    + type = text
  + **story**
    + 商品寓意
    + type = text
  + **components**
    + 包含组件信息列表的字符串
    + "{'components': ['component': '', 'length': '', 'width': '', 'height': '', 'area': '', 'category_id': '', 'carve_id': '', 'paint_id': '', 'decoration_id':　'', 'tenon_id': '', 'amount': '']}"
    + required
    + **component**
      + 组件名称
      + type = text
      + required
    + **length**
      + 组件长度
      + type = text
      + 组件长宽高与适用面积二选其一
      + 组件长宽高只能全部填写或全不填写
    + **width**
      + 组件宽度
      + type = text
    + **height**
      + 组件高度
      + type = text
    + **area**
      + 组件适用面积
      + type = text
      + 组件适用面积与长宽高二选其一
    + **category_id**
      + 组件种类id
      + type = text
      + required
    + **carve_id**
      + 雕刻id
      + type = text
      + required
    + **decoration_id**
      + 装饰工艺id
      + type = text
      + required
    + **tenon_id**
      + 榫卯结构id
      + type = text
      + required
    + **amount**
      + 组件数量
      + type = text
      + required

### vendor item detail
+ **URL**
  + /vendor/items?item=
+ **method**
  + GET
+ **parameters**
  + item: item id

### vendor edit item
+ **URL**
  + /vendor/items/\<int:id\>
+ **method**
  + PUT
+ **parameters**
  + : item id

### vendor delete item
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
    
### vendor distributors
+ **URL**
  + /vendor/distributors
+ **method**
  + GET

### vendor distributor detail
+ **URL**
  + /vendor/distributors/\<distributor_id\>
+ **method**
  + GET

### vendor distributor invitation
+ **URL**
  + /vendor/distributors/invitation
+ **method**
  + GET, POST

### vendor distributors revocation
+ **URL**
  + /distributors/\<int:distributor_id\>/revocation
+ **method**
  + POST
    
### vendor settings
+ **URL**
  + /vendor/settings
+ **method**
  + GET
  + POST

### vendor reconfirm
+ **URL**
  + /vendor/reconfirm
+ **method**
  + GET
  + POST


## privilege

### login
+ **URL**
  + /privilege/login
+ **method**
  + GET, POST
+ **postData**
  + username
  + password
    
### vendor_confirm
+ **URL**
  + /privilege/vendor_confirm
+ **method**
  + GET
    
### vendor_confirm reject
+ **URL**
  + /privilege/vendor_confirm/reject
+ **method**
  + POST
+ **postData**
  + vendor_id
  + reject_message
    
### vendor_confirm pass
+ **URL**
  + /privilege/vendor_confirm/pass
+ **method**
  + POST
+ **postData**
  + vendor_id
    
### distributors revocation
+ **URL**
  + /privilege/distributors/revocation
+ **method**
  + GET
  + POST
+ **postData**
  + distributor_revocation_id
  + revocation_confirm

## Service
### mobile register sms
+ **URL**
  + /service/mobile_register_sms
+ **method**
  + POST
+ **postData**
  + mobile
+ **return**
  + 成功
    + `{"success": true}`
  + 失败
    + `{"success": false, "message": ""}`
    
### send email
+ **URL**
  + /service/send_email
+ **method**
  + POST
+ **parameters**
  + **type**(以下之一)
    + USER_REGISTER
    + USER_EMAIL_CONFIRM
    + VENDOR_EMAIL_CONFIRM
+ **postData**
  + USER_REGISTER
    + **csrf_token**
    + **email**
      + 用户邮箱
      + require
  + USER_EMAIL_CONFIRM
    + **csrf_token**
    + **role**
      + 身份
      + value = user
    + **id**
      + 用户id
  + VENDOR_EMAIL_CONFIRM
    + **csrf_token**
    + **role**
      + 身份
      + value = vendor
    + **id**  
      + 用户id
      + require
+ **return**
  + 成功
    + ```{"success": true}```
  + 失败
    + `{"success": false, "message": ""}`
    
### image captcha
+ **URL**
  + /service/\<string:token\>.jpg
+ **method**
  + GET
+ **return**
  + img
  
### cities list
+ **URL**
  + /service/cities
+ **mehtod**
  + GET
+ **return**
  + json
  + `{"A": {"ankang": {"city": "安康", "dist_count": "5"}}}`
