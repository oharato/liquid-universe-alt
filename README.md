# Liquid Universe Alt

落合陽一氏のアート作品「リキッドユニバース（Liquid Universe）」にインスパイアされた、リアルタイムで波打つ液体金属膜・融合メタボール・ナビエ・ストークス流体渦のインタラクティブ3Dビジュアライゼーション。

🌐 **デモ**: [https://oharato.github.io/liquid-universe-alt/](https://oharato.github.io/liquid-universe-alt/)

## ✨ 特徴

- **ワンクリック・プリセットドック（画面下部UI ＆ Leva連動）**
  - 複雑なパラメータを触らなくても、導入した各技術（ナビエ・ストークス流体、3Dメタボール、カールノイズ磁性流体、薄膜構造色、音波共鳴コースティクス）の効果を**1クリックで即座に体験できる5種類のプリセットボタン**を搭載。
  - 表示モード（**全画面 / 球体 / メタボール**）もドック右上のピルボタンからワンクリックで切り替え可能。
- **本物のGPU流体力学シミュレーション（`@whatisjery/react-fluid-distortion`）**
  - Jos Stam の Stable Fluids（ナビエ・ストークス方程式）をポストプロセスとして統合。マウスでなぞった軌跡に本物のカルマン渦・屈折歪み・虹色分散が発生。
- **3つのジオメトリ表示モード**
  - **全画面 (`fullscreen`)**: 画面全体を覆う波打つ液体水銀ミラー。
  - **球体 (`sphere`)**: 空間に浮かぶ高精細液体金属球。
  - **融合メタボール (`metaballs`)**: `@react-three/drei` の `<MarchingCubes>` を用い、複数の液体金属滴が軌道を巡りながらヌルヌルと結合・分離する等値面。マウスカーソルに追従する金属滴を動かして他の球体と融合可能。
- **多層流体シェーダー（3D Curl Noise + Domain Warping + FBM + 干渉波）**
  - 非圧縮流体の速度場を作る **3D Curl Noise（カールノイズ）**、座標を渦状に歪める **ドメインワーピング**、**4オクターブFBM**、および **多点波源の同心円干渉波（Ripples）** を合成。
- **光学薄膜干渉（Thin-Film Iridescence）＆ 空間ポストプロセッシング**
  - `THREE.MeshPhysicalMaterial` の薄膜干渉（Iridescence）・クリアコート・異方性反射に加え、**Mipmap Bloom**・**Radial Chromatic Aberration（色収差）**・**Vignette** を単一WebGLパイプライン内で統合。

## 🎛 5つのショーケース・プリセット（[`src/presets.ts`](src/presets.ts)）

| プリセット名 | 主役の技術・ライブラリ | 特徴 |
|---|---|---|
| **🌊 水銀ミラー** | `Navier-Stokes Fluid + FBM` | 全画面の純粋な鏡面水銀膜の上を、マウス軌跡に沿ってナビエ・ストークス流体渦が滑らかに走る王道表現 |
| **🫧 融合メタボール** | `Drei MarchingCubes + CSM` | 宙に浮かぶ複数の液体金属滴がヌルッと結合・分離。カーソルで金属滴を引っ張って合体させられる3Dモード |
| **🌀 カール磁性流体** | `3D Curl Noise + Domain Warp` | 非圧縮カールノイズとドメインワーピングを最大化し、磁性流体（フェロフルード）のように鋭く渦巻く球体 |
| **🌈 構造色オイルスリック** | `Thin-Film Iridescence + Rainbow Fluid` | 薄膜光学干渉（Iridescence）と虹色流体渦を組み合わせた、シャボン玉・酸化チタン皮膜のような極彩色表現 |
| **⚡ 音波共鳴コースティクス** | `Harmonic Ripples + Caustic Bloom` | 多点波源の干渉波と等高線エッジ発光（Caustic Glow）＋強Bloomによるサイマティクス（音波共鳴）表現 |

## 🛠 技術スタックとバージョン

言語ランタイム・パッケージマネージャーは `mise`（[`.mise.toml`](.mise.toml)）で固定し、すべての依存パッケージは7日間のクールダウン基準を満たす安定版にバージョン固定（[`package.json`](package.json)）しています。

| カテゴリ | ツール / ライブラリ | バージョン | 主な役割・新機能活用 |
|---|---|---|---|
| ランタイム | Node.js (LTS) | `26.13.1` | `mise` 管理 |
| パッケージ管理 | pnpm | `12.18.0` | `https://npm.flatt.tech` レジストリ利用 |
| UIフレームワーク | React / React DOM | `19.3.1` | Concurrent rendering |
| 3Dエンジン | Three.js | `0.187.0` | PBR (`iridescence`, `anisotropy`, `clearcoat`) |
| React 3Dレンダラー | `@react-three/fiber` | `9.8.2` | Three.js r187 対応・ポインター追跡 |
| 3Dヘルパー | `@react-three/drei` | `10.7.9` | `MarchingCubes` (メタボール), HDR環境マップ (`useEnvironment`) |
| 流体シミュレーション | `@whatisjery/react-fluid-distortion` | `1.6.3` | ナビエ・ストークスGPU流体ソルバー (`<Fluid />`) |
| ポストプロセス | `@react-three/postprocessing` / `postprocessing` | `3.2.2` / `6.39.6` | `EffectComposer`, `Bloom`, `ChromaticAberration`, `Vignette` |
| シェーダー注入 | `three-custom-shader-material` | `6.4.0` | PBRマテリアルへのVertex/Fragment GLSL注入 |
| GUIコントロール | Leva | `0.10.1` | プリセット切替＆詳細パラメータ微調整UI |
| ビルドツール | Vite (Rolldown) | `8.3.5` | Rolldown ベースの高速バンドル |
| 言語 / 型検査 | TypeScript | `6.0.3` | `strict: true` による厳格な型検証 |

## 🚀 環境構築・セットアップ

### 1. `mise` によるツールチェーン有効化

```bash
mise trust
mise install
```

### 2. レジストリ設定とパッケージインストール

本プロジェクトでは [`.npmrc`](.npmrc) にて `https://npm.flatt.tech` を指定しています。

```bash
# 依存パッケージのインストール
pnpm install

# 開発サーバーの起動
pnpm run dev

# 型チェック＆プロダクションビルド
pnpm run build

# Lint 実行
pnpm run lint
```

## 📁 プロジェクト構成

```text
.
├── .mise.toml                       # Node.js / pnpm バージョンおよびクールダウン設定
├── .npmrc                           # npm.flatt.tech レジストリ設定
├── src/
│   ├── App.tsx                      # メインアプリ（プリセットドック・Leva・Fluid/PostProcessing）
│   ├── App.css                      # グラスモーフィズムUIドック＆グローバルスタイル
│   ├── presets.ts                   # 5つのショーケース・プリセット定義
│   ├── components/
│   │   ├── LiquidMetal.tsx          # 液体金属メッシュ（Fullscreen / Sphere / MarchingCubes Metaballs）
│   │   └── MorphingEnvironment.tsx  # 環境マップのクロスフェード管理
│   └── shaders/
│       ├── LiquidMetalShaders.ts    # Vertex/Fragment GLSL（Curl Noise + Domain Warp + 薄膜変調）
│       └── noise.glsl.ts            # 3D Simplex Noise, 4-Octave FBM, 3D Curl Noise 実装
```

## 🔧 トラブルシューティング・パフォーマンス設計メモ

- **`MarchingCubes` メタボールの角ばり解消（Newton-Raphson 等値面射影 ＋ 解析的勾配法線）**:
  - `three-stdlib` の `MarchingCubes` は粗い3Dグリッド上で非正規化の勾配ベクトル（$\propto 1/r^2$）を線形補間するため、そのままではグリッドセル単位のダイヤ状の角ばり（ファセット）が目立ちます。
  - [`src/shaders/LiquidMetalShaders.ts`](src/shaders/LiquidMetalShaders.ts) の `evaluateMetaballSurface()` にて、各メタボールの中心座標と強度（`uMetaballs[8]`）から解析的なスカラー場 $F(\mathbf{b})$ と厳密な解析勾配 $\nabla F(\mathbf{b})$ を計算し、1ステップの **Newton-Raphson 法** で粗いメッシュ頂点を真の曲面等値面（$F = 80.0$）へ吸着させるとともに、完全な $C^1$ 連続の滑らかな法線を算出しています。
- **`MarchingCubes` での UV・異方性反射 (`anisotropy`) の制御**:
  - Three.js `r187` の `MeshPhysicalMaterial` で `anisotropy > 0` (`USE_ANISOTROPY`) を有効にすると、フラグメントシェーダー内の `getTangentFrame` が `dFdx(vUv)` から接空間を計算するため、`enableUvs={false}` だとゼロ除算により全ピクセルが `NaN`（完全な黒・非表示）になります。そのためメタボールモードでは `enableUvs={true}` かつ `anisotropy={0}` に制御しています（[`src/components/LiquidMetal.tsx`](src/components/LiquidMetal.tsx)）。
- **HDR切替時のフリーズ（シェーダー再コンパイル）防止と CPU 負荷削減**:
  - HDR環境マップのクロスフェード完了時に背面の `<LiquidMetal>` をアンマウントすると、`three-custom-shader-material` が `dispose()` を呼んで WebGL シェーダープログラムを破棄し、次回クロスフェード開始時にメインスレッドで同期的なシェーダー再コンパイル（約200〜400msの停止）が発生します。[`src/components/MorphingEnvironment.tsx`](src/components/MorphingEnvironment.tsx) では2枚の `<LiquidMetal>` レイヤーを常時マウントしたまま保持し、非表示レイヤーは `visible = false` かつ `useFrame` 更新をスキップすることで、カクつきゼロのクロスフェードを実現しています。
  - また、3Dオブジェクトモード（`sphere` / `metaballs`）の `<ContactShadows>` に `frames={1}` を指定（[`src/App.tsx`](src/App.tsx)）し、毎フレーム5パス分のシャドウ用 `gl.render()` が CPU で走るのを防いでいます。
- **GPU負荷最適化（1頂点あたりのノイズ計算量削減）**:
  - 法線再計算の近傍サンプリングごとに `curlNoise` や `domainWarp` を重複計算すると 1頂点あたり 170回以上の `snoise` 呼び出しが発生しGPU負荷が飽和するため、[`src/shaders/LiquidMetalShaders.ts`](src/shaders/LiquidMetalShaders.ts) では中心頂点で1回だけ `fastCurl` と `warp` を計算して近傍サンプルへ再利用する設計（約1/12の演算量）に最適化しています。
- **`mise` の未信頼エラーが出る場合**:
  - `mise trust` を実行してリポジトリ直下の `.mise.toml` を信頼リストに登録してください。
- **パッケージ追加・更新時のポリシー**:
  - 新規パッケージ追加時は `pnpm add <pkg>@<exact-version> --save-exact` を使用し、リリースから7日間以上経過したバージョンを指定してください。

## 📝 ライセンス

MIT
