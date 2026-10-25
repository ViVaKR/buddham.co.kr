# public/assets/ 구조

```bash
assets/
├── og-images/
│ ├── default-og.jpg # 1200x630 (기본 OG 이미지)
│ ├── product-og-template.jpg # 1200x630 (상품용)
│ └── article-og-template.jpg # 1200x630 (블로그용)
└── logos/
├── logo-square.png # 400x400 (Twitter summary용)
└── logo-wide.png # 1200x630 (기타)
```

- ✅ summary_large_image = 큰 이미지 (1200x630) - 대부분 이거 써
- ✅ summary = 작은 정사각형 이미지 - 프로필/로고
- ✅ 기본값으로 summary_large_image 추천
- ✅ 이미지 비율 맞춰서 준비 (안 그러면 잘림)
- 친구야, 대부분의 경우 summary_large_image가 시각적으로 훨씬 임팩트 있어서 이걸 기본값으로 쓰는 게 좋아! 🎨✨
