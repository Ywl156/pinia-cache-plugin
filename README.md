# pinia-cache-plugin

**pinia state cache plugin (pinia 状态持久化缓存插件)**
<br />

通过 localStorage 缓存 pinia 状态。

### 安装

`npm install pinia-cache-plugin`

### 使用

```js
import { createPinia } from 'pinia';
import piniaCachePlugin from 'pinia-cache-plugin';

const store = createPinia();

// 默认参数
/* {
  allCache: false,
  excludeNameArray: [],
  cacheNameArray: [],
  cacheNameExpire: {
    defaultExpire: 'local',
  },
}, */
store.use(piniaCachePlugin(options));
```

### 参数介绍

```js
{
  // 是否缓存所有状态，默认不缓存
  allCache: boolean;
  // 排除状态 storeId，默认不排除
  excludeNameArray: string[];
  // 缓存状态 storeId，默认不缓存
  cacheNameArray: string[];
  // 缓存时间，默认 local (持久保存)
  // 可以设置过期时间数值，单位为毫秒（多少毫秒后过期）
  cacheNameExpire: {
    // 默认使用状态
    defaultExpire: 'local',
    // 单独设置状态（优先）
    [key: string]: 'local' | number
  };
}
```
