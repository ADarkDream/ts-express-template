// .prettierrc.cjs
// @see: https://www.prettier.cn

module.exports = {
  // 指定最大换行长度
  printWidth: 100,
  // 强制文本换行 (Markdown 和纯文本内容)
  proseWrap: "always",
  // 缩进制表符宽度 | 空格数
  tabWidth: 2,
  // 使用制表符而不是空格缩进行 (true：制表符，false：空格) [空格更易于在不同编辑器下控制和确保一致性]
  useTabs: false,
  // 结尾使用分号 (true：有，false：没有)
  semi: false,
  // 使用单引号 (true：单引号，false：双引号)
  singleQuote: false,
  // 在对象字面量中决定是否将属性名用引号括起来 可选值 "<as-needed|consistent|preserve>"
  quoteProps: "as-needed",
  // 在 JSX 中使用单引号而不是双引号 (true：单引号，false：双引号)
  jsxSingleQuote: false,
  // 多行时尽可能打印尾随逗号 "<none|es5|all>"
  // "all": 在所有可能的地方都加尾随逗号，便于 Git diff 和版本控制
  trailingComma: "all",
  // 在对象，数组括号与文字之间加空格 "{ foo: bar }" (true：有，false：没有)
  bracketSpacing: true,
  // 将 > 多行元素放在最后一行的末尾，而不是单独放在下一行 (true：放末尾，false：单独一行)
  bracketSameLine: false,
  // (x) => {} 箭头函数参数只有一个时是否要有小括号 (avoid：省略括号，always：不省略括号)
  arrowParens: "always",
  // 指定要使用的解析器，不需要写文件开头的 @prettier
  requirePragma: false,
  // 可以在文件顶部插入一个特殊标记，指定该文件已使用 Prettier 格式化
  insertPragma: false,
  // 换行符 ("auto"：根据当前操作系统自动选择换行符,"lf"：Linux/macOS,"crlf"：Windows,"cr":旧操作系统)
  endOfLine: "auto",
  // 这两个选项可用于格式化以给定字符偏移量（分别包括和不包括）开始和结束的代码
  // rangeStart：开始，rangeEnd：结束
  rangeStart: 0,
  rangeEnd: Infinity,
}
