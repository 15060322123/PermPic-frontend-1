import zhLocale from "element-ui/lib/locale/lang/zh-CN"; //引入element语言包
const cn = {
  blog: {
    home: "主页",
    blog: "日志",
    uploadLogin: "选择Arweave钱包",
    loginSuccess: "登录成功！",
    create: "新建日志",
    createSuccess: "创建成功!",
    title: "标题",
    dialog_tags: "标签...(多个已空格分割)",
    cancel: "取消",
    confirm: "确定",
    readAll: "阅读原文",
    back: "返回",
    prev: "上一篇",
    next: "下一篇",
    noPrev: "没有上一篇了!",
    noNext: "没有下一篇!",
    edit: "修改",
    save: "保存",
    saveSuccess: "保存成功!",
    preview: "预览",
    author: "作者名称",
    syncFee: "同步需要花费",
    Synchronizing: "正在同步",
    SyncToAr: "同步到ARweave",
    anonymous: "匿名",
    insufficient: "AR 余额不足!",
    waitBlockSync: "等待区块同步",
    dropFile: "将文件拖到此处，或",
    clickUpload: "点击上传",
    readFileError: "读取文件错误,请重试"
  },
  ...zhLocale,
};

export default cn;