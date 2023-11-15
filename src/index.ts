import type { PiniaPlugin } from 'pinia';

// 存储在localStorage的key
enum PiniaStoreKeys {
  allCache = '__ps_store__',
  expire = '__ps_expire__',
}
// 各state的存储时间定义
interface CacheNameExpire {
  defaultExpire: 'local' | number;
  [key: string]: 'local' | number;
}
// 默认参数、用户传参类型
interface DefPiniaCachePluginOptions {
  allCache: boolean;
  excludeNameArray: string[];
  cacheNameArray: string[];
  cacheNameExpire: CacheNameExpire;
}
interface PiniaCachePluginOptions extends Partial<DefPiniaCachePluginOptions> {}

/**
 * ```
 * pinia持久化储存
 * const store = createPinia();
 * store.use(piniaCachePlugin(options))
 * ```
 * @param options {@link PiniaCachePluginOptions}
 * @returns PiniaPlugin
 */
const piniaCachePlugin = (options?: PiniaCachePluginOptions) => {
  // 参数合并
  const _options: DefPiniaCachePluginOptions = Object.assign(
    {
      allCache: false,
      excludeNameArray: [],
      cacheNameArray: [],
      cacheNameExpire: {
        defaultExpire: 'local',
      },
    },
    options
  );
  const { allCache, cacheNameArray, excludeNameArray, cacheNameExpire } = _options;

  const plugin: PiniaPlugin = ctx => {
    // 根据用户配置，从localStorage中恢复缓存、监听state变化进行缓存
    if (allCache) {
      // 全部state启用持久化缓存
      if (excludeNameArray.includes(ctx.store.$id)) return;

      // 恢复缓存
      const store = localStorage.getItem(PiniaStoreKeys.allCache);
      if (store) {
        const ps = JSON.parse(store);
        if (ps[ctx.store.$id]) {
          if (ps[ctx.store.$id][PiniaStoreKeys.expire] === 'local' || ps[ctx.store.$id][PiniaStoreKeys.expire] > Date.now()) {
            // 没过期
            ctx.store.$state = ps[ctx.store.$id].state;
          } else {
            // 已过期，删除
            Reflect.deleteProperty(ps, ctx.store.$id);
            localStorage.setItem(PiniaStoreKeys.allCache, JSON.stringify(ps));
          }
        }
      }

      // 监听state变化进行缓存
      ctx.store.$subscribe((_, state) => {
        const store = localStorage.getItem(PiniaStoreKeys.allCache);
        // state的过期时间
        let nameExpire = cacheNameExpire[ctx.store.$id] || cacheNameExpire.defaultExpire;
        nameExpire = typeof nameExpire === 'number' ? Date.now() + nameExpire : nameExpire;

        if (store) {
          // 已存在，先修改再覆盖
          const ps = JSON.parse(store);
          ps[ctx.store.$id] = {
            state,
            [PiniaStoreKeys.expire]: nameExpire,
          };
          localStorage.setItem(PiniaStoreKeys.allCache, JSON.stringify(ps));
        } else {
          // 不存在，直接创建
          localStorage.setItem(
            PiniaStoreKeys.allCache,
            JSON.stringify({
              [ctx.store.$id]: {
                state,
                [PiniaStoreKeys.expire]: nameExpire,
              },
            })
          );
        }
      });
    } else if (cacheNameArray.length) {
      // 部分使用持久化缓存
      if (cacheNameArray.includes(ctx.store.$id)) {
        const storeKey = `__ps-${ctx.store.$id}__`;

        // 恢复缓存
        const store = localStorage.getItem(storeKey);
        if (store) {
          const ps = JSON.parse(store);
          if (ps[PiniaStoreKeys.expire] === 'local' || ps[PiniaStoreKeys.expire] > Date.now()) {
            ctx.store.$state = ps.state;
          } else {
            localStorage.removeItem(storeKey);
          }
        }

        // 监听state变化进行缓存
        ctx.store.$subscribe((_, state) => {
          let nameExpire = cacheNameExpire[ctx.store.$id] || cacheNameExpire.defaultExpire;
          nameExpire = typeof nameExpire === 'number' ? Date.now() + nameExpire : nameExpire;

          localStorage.setItem(
            storeKey,
            JSON.stringify({
              state,
              [PiniaStoreKeys.expire]: nameExpire,
            })
          );
        });
      }
    }
  };
  return plugin;
};

export default piniaCachePlugin;
