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
        item

###user setting
    URL:
        /user/setting
    method:
        GET, POST
        
##producer

###producer register
    URL:
        /producer/register
    method:
        GET, POST

###producer login
    URL:
        /producer/login
    method:
        GET, POST

###producer logout
    URL:
        /producer/logout
    method:
        GET, POST

###producer reset password
    URL:
        /producer/reset_password
    method:
        GET, POST

###producer item list
    URL:
        /producer/list
    method:
        GET, POST
    parameters:
        item

##item

###item list
    URL:
        /items
    method:
        GET, POST
    parameters:
        id, page

###item detail
    URL:
        /items/detail
    method:
        GET
    parameters:
        id

###item filter
    URL:
        /items
    method:
        GET
    parameters:
        page
    
###item compare
    URL:
        /items/compare
    method:
        GET
    parameters:
        first, second