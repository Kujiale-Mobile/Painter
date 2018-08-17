module.exports = {
    // 以当前目录为根目录，不再向上查找 .eslintrc.js
    "root": true,
    "parser": "babel-eslint",
    "extends": ["airbnb-base"],
    "plugins": [
      "import",
    ],
    "parserOptions": {
      "ecmaVersion": 6,
      ecmaFeatures: {
        jsx: true,
      }
    },
    "env": {
      "es6": true,
      "browser": true
    },
    "rules": {
      // @fixable rn推荐用两个空格
      "indent": ['error', 2, {
        SwitchCase: 1,
        flatTernaryExpressions: true
      }],
      // 禁止使用 console
      // @off console 的使用很常见
      "no-console": 'off',
      "one-var": 'off',
      // @warn 无用变量警告
      "no-unused-vars": ['warn', { "vars": "all", "args": "none" }],
      // @error 变量必须先定义后使用
      'no-use-before-define': ['error', { functions: false, classes: false, variables: false }],
      // 在类的非静态方法中，必须存在对 this 的引用
      // @off 太严格了
      'class-methods-use-this': 'off',
      // @error 禁止出现连续的多个空格，除非是注释前，或对齐对象的属性、变量定义、import 等
      'no-multi-spaces': [
        'error',
        {
          ignoreEOLComments: true,
          exceptions: {
            Property: true,
            BinaryExpression: false,
            VariableDeclarator: true,
            ImportDeclaration: true
          }
        }
      ],
      // @off 条件加载很常见
      'global-require': 'off',
      // @warn 限制一行长度 120字符
      'max-len': ['warn', { code: 120 }],
      // You can't require images in node by default - only .js, .json, and .node.
      // require图片报错 这里关掉这条
      'import/no-unresolved': 'off',
      // @off 下划线在变量名中很常用
      'no-underscore-dangle': 'off',
      // 箭头函数能够省略 return 的时候，必须省略，比如必须写成 () => 0，禁止写成 () => { return 0 }
      // @off 箭头函数的返回值，应该允许灵活设置
      'arrow-body-style': 'off',
      // 禁止在 else 内使用 return，必须改为提前结束
      // @off else 中使用 return 可以使代码结构更清晰
      'no-else-return': 'off',
      // 禁止使用嵌套的三元表达式，比如 a ? b : c ? d : e
      // @off 没必要限制
      'no-nested-ternary': 'off',
      // 必须使用模版字面量而不是字符串连接
      // @warn 字符串连接很常用
      'prefer-template': 'warn',
      // 申明后不再被修改的变量必须使用 const 来申明
      // @warn 没必要强制要求
      'prefer-const': 'warn',
      // 必须使用解构
      // @warn 没必要强制要求
      'prefer-destructuring': 'warn',
      // 限制换行符为 LF 或 CRLF
      // @off 没必要限制
      'linebreak-style': 'off',
      // 禁止使用特定的语法
      // @off 它用于限制某个具体的语法不能使用
      'no-restricted-syntax': 'off',
      // 禁止使用 ++ 或 --
      // @off 没必要限制
      'no-plusplus': 'off',
      // 禁止混用不同的操作符，比如 let foo = a && b < 0 || c > 0 || d + 1 === 0
      // @off 太严格了，可以由使用者自己去判断如何混用操作符
      'no-mixed-operators': 'off',
      // 必须使用 a = {b} 而不是 a = {b: b}
      // @off 没必要强制要求
      'object-shorthand': 'off',
      // @fixable es6默认是srtict mode https://github.com/facebook/react-native/pull/16163
      // 开着这条会提示'use strict' is unnecessary inside of modules. (strict)
      'strict': 'warn',
      // 禁止函数在不同分支返回不同类型的值
      // @off 太严格了
      'consistent-return': 'off',
      // @fixable 禁止 else 中只有一个单独的 if
      // @off 单独的 if 可以把逻辑表达的更清楚
      'no-lonely-if': 'off',
      // 禁止无用的表达式
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true
        }
      ],
      // @fixable 注释前后必须有空格
      'spaced-comment': [
        'error',
        'always',
        {
          block: {
            exceptions: [
              '*'
            ],
            balanced: true
          }
        }
      ],
      // @fixable 必须使用 ... 而不是 apply，比如 foo(...args)
      // @off  apply 很常用
      'prefer-spread': 'off',
      // 禁止使用 hasOwnProperty, isPrototypeOf 或 propertyIsEnumerable
      // @off 很多地方会用到 hasOwnProperty
      'no-prototype-builtins': 'off',
      // @fixable 禁止出现 foo['bar']，必须写成 foo.bar
      // @off 当需要写一系列属性的时候，可以更统一
      'dot-notation': 'off',
      // 对象的最后一个属性末尾必须有逗号
      'comma-dangle': 'warn',

      "import/extensions": [2, "never",
        {
          "json": "always",
          "svg": "always"
        }
      ],

      // 小程序
      "guard-for-in": "off",
      "no-undef": "off",
      "func-names": "off",
    }
  };
  