# 山河有时 · 中国四季旅行与旅居图鉴

一个单文件、离线可用的中国地图网页：既看四季旅行风景，也看每个城市逐月的体感舒适度，并提供非住房普通消费价格参考。

## 在线访问

**https://baixingshuang.github.io/china-season-atlas/**

## 打开

双击 `中国四季旅行地图.html` 即可。网页已内嵌全部地图、城市边界、气候、消费与景点数据，不需要联网，也没有外部依赖。

- 顶部「旅行 / 旅居 / 成本」切换地图模式。
- 旅行、旅居模式下用底部滑杆切换月份；成本模式为年度指数，不随月份变化。
- 点击任意城市查看该市气候与消费详情。

## 项目结构

```text
中国四季旅行地图/
├─ 中国四季旅行地图.html   # 最终单文件网页
├─ preview.png              # 旅居模式预览
├─ preview-city.png         # 城市气候详情预览
├─ preview-cost.png         # 生活成本模式预览
├─ preview-cost-city.png    # 城市消费详情预览
├─ README.md
└─ china-travel-map/
   ├─ build.py              # 组装最终 HTML
   ├─ src/
   │  ├─ template.html
   │  ├─ style.css
   │  └─ app.js
   └─ data/
      ├─ scenic_data.json   # 城市边界 + 景点 + 气候 + 消费 + 月度评分
      ├─ climate.json       # 370 城的 24 段半月气候常年值
      ├─ cost.json          # 370 城的非住房消费价格指数
      ├─ numbeo_anchors.json
      ├─ province_consumption.json
      ├─ map_data.json
      ├─ spots.py
      ├─ prepare_map.py
      ├─ build_data.py
      ├─ build_cost.py
      ├─ fetch_all.py
      ├─ fetch_climate_whisper.py
      └─ fetch_cost_data.py
```

## 重新构建

只依赖 Python 标准库：

```bash
python china-travel-map/build.py
```

会重新生成项目根目录下的 `中国四季旅行地图.html`。

## 数据与说明

- 地图边界：DataV.GeoAtlas，仅作旅行与旅居示意，不作为行政区划依据。
- 气候常年值：1991—2020 年，来自 [WeatherWhisper](https://github.com/lzq1206/WeatherWhisper) 的预处理数据（NOAA GSOD 温度/露点，NASA POWER/MERRA-2 降水、云量、风速、日照）。
- 体感舒适度：由体感温度、湿度、降水和日照综合计算的编辑模型，非官方排名或医疗建议。
- 非住房消费指数：以 [Numbeo 中国城市数据](https://www.numbeo.com/cost-of-living/country_result.jsp?country=China) 的 12 个实测锚点（Cost of Living Index、食品杂货、餐饮、交通/水电原始价格）为基础，结合 [聚金数据省级居民人均消费支出](https://www.jujindata.com/indicator/province/personal-consumption) 的省级模型估算其余城市；指数以 **上海 = 100** 表示，剔除房租与房价，仅作生活成本参考，不构成官方统计。
- 370 个城市与地区中，340 个使用直接气候站，30 个县级市使用邻近气候站参考；详情页会标注。
- 消费指数中 12 个城市为 Numbeo 实测，其余为省级消费水平估算；页面会标注「实测 / 估算」。
