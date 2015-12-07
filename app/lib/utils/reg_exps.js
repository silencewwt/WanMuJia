let reg = {
  getRegs: (key) => {
    let regs = {
      email: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/,
      mobile: /^((1[3-8][0-9])+\d{8})$/,
      captcha: /^\d{6}$/,
      nickname: /^(?!\d+$)[\u4e00-\u9fa5A-Za-z\d_]{4,30}$/,
      tel: /^\d{3,4}-?\d{7,9}$/,
      identity: /^\d{15}(\d\d[0-9xX])?$/,
      password: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,}$/,
      userPassword: /^[0-9A-Za-z_.]{6,16}$/,
      date: /^(\d{4})\/((0?([1-9]))|(1[0|1|2]))\/((0?[1-9])|([12]([0-9]))|(3[0|1]))$/
    };
    return key ? regs[key] : regs;
  }
};

module.exports = reg;
