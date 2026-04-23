# Liquid Universe

落合陽一氏のアート作品にインスパイアされた、リアルタイムで波打つ液体金属のインタラクティブ3Dビジュアライゼーション。

🌐 **デモ**: [https://oharato.github.io/liquid-universe-alt/](https://oharato.github.io/liquid-universe-alt/)

## ✨ 特徴

- **リアルな液体金属表現** — 物理ベースレンダリング（PBR）をベースに、カスタムGLSLシェーダーで頂点変位を実現
- **環境マップのクロスフェード** — 10種類のHDR環境マップが、暗転せずにシームレスにモーフィング
- **2つの表示モード**
  - **球体モード**: 空間に浮かぶ液体金属の球体（マウスで回転可能）
  - **全画面モード**: 画面全体を覆う波打つリキッドミラー
- **自動カラーサイクル** — HSLカラースペースを使い、色相がなめらかに循環
- **リアルタイムパラメータ調整** — Leva UIパネルで全パラメータをGUIから即座に変更可能

## 🛠 技術スタック

| カテゴリ | ライブラリ |
|---|---|
| 3Dレンダリング | [React Three Fiber (R3F)](https://docs.pmnd.rs/react-three-fiber) |
| ヘルパー | [@react-three/drei](https://github.com/pmndrs/drei) |
| シェーダー注入 | [three-custom-shader-material (CSM)](https://github.com/FarazzShaworma/THREE-CustomShaderMaterial) |
| UIコントロール | [Leva](https://github.com/pmndrs/leva) |
| ビルドツール | [Vite](https://vitejs.dev/) |
| 言語 | TypeScript / GLSL |

## 🚀 セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build
```

## 📁 プロジェクト構成

```
src/
├── App.tsx                          # メインアプリ（Leva UIコントロール・自動切り替えロジック）
├── App.css                          # グローバルスタイル
├── components/
│   ├── LiquidMetal.tsx              # 液体金属メッシュ（CSM + PBR + カラーサイクル）
│   └── MorphingEnvironment.tsx      # 環境マップのクロスフェード管理
└── shaders/
    └── LiquidMetalShaders.ts        # GLSLシェーダー（Simplex Noise + 頂点変位 + 法線再計算）
```

## 🎛 調整可能なパラメータ

### Environment（反射する写真）
- **表示モード** — 球体 / 全画面
- **プリセット** — 都市、夕暮れ、夜明け、夜、倉庫、森、部屋、スタジオ、ロビー、公園
- **自動切り替え** — ON/OFF
- **切り替え間隔** — 1〜20秒
- **フェード時間** — 0.1〜10秒
- **背景として表示** — ON/OFF

### Liquid Metal
- **速度 / ノイズ密度 / ノイズ強度** — 波のうねり方を制御
- **粗さ / 金属度** — PBRマテリアルの質感
- **色を自動循環** — ON/OFF
- **色の変化スピード** — 0.01〜0.5

## 📝 ライセンス

MIT
