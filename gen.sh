#!/usr/bin/env zsh

if [ -z "$1" ]; then
  echo "❌ 사용법: $0 [도메인명]"
  echo "예시: $0 canon"
  exit 1
fi

DOMAIN=$1
# shellcheck disable=SC2296
DOMAIN_PASCAL=$(echo "${(C)DOMAIN}" | tr -d '-')
BASE="pages/$DOMAIN"
SRC_BASE="src/app/$BASE"

# ✅ 사전 체크
if [ -d "$SRC_BASE" ]; then
  echo "⚠️  '$DOMAIN' 도메인이 이미 존재합니다!"
  echo "   덮어쓰려면 'y', 취소는 다른 키를 입력하세요: "
  read -r confirm
  if [ "$confirm" != "y" ]; then
    echo "🙏 취소되었습니다. 성불하십시오!"
    exit 0
  fi
fi

# 불교적 네이밍 — 단일어, 의미 중심
HOME_NAME="mandala"     # Home     — 우주의 중심, 전체를 조망하는 대시보드
LIST_NAME="samsara"     # List     — 윤회, 반복되는 흐름과 목록
FORM_NAME="karma"       # Form     — 행위(業), 생성·수정하는 행위
DETAIL_NAME="vipassana" # Detail   — 위빠사나, 깊이 들여다보는 통찰

echo "🪷 Buddham — '$DOMAIN' 도메인 생성을 시작합니다."

# ── 1. 부모 레이아웃 컴포넌트 (일반 export 유지)
echo "\n📦 1. 부모 레이아웃"
ng g c $BASE/$DOMAIN --selector $DOMAIN

# ── 2. Home (Mandala)
echo "\n📦 2. ${DOMAIN}-${HOME_NAME} (Home)"
ng g c $BASE/${DOMAIN}-${HOME_NAME} --selector ${DOMAIN}-${HOME_NAME}

# ── 3. List (Samsara)
echo "\n📦 3. ${DOMAIN}-${LIST_NAME} (List)"
ng g c $BASE/${DOMAIN}-${LIST_NAME} --selector ${DOMAIN}-${LIST_NAME}

# ── 4. Form (Karma)
echo "\n📦 4. ${DOMAIN}-${FORM_NAME} (Form)"
ng g c $BASE/${DOMAIN}-${FORM_NAME} --selector ${DOMAIN}-${FORM_NAME}

# ── 5. Detail (Vipassana)
echo "\n📦 5. ${DOMAIN}-${DETAIL_NAME} (Detail)"
ng g c $BASE/${DOMAIN}-${DETAIL_NAME} --selector ${DOMAIN}-${DETAIL_NAME}


# ── 🔄 [🎯 수정 완료: 환경 맞춤형 핀포인트 변환 로직] ──────────────────────────────────────
echo "\n⚙️  핵심 5대 컴포넌트 라우트 최적화를 위한 'export default' 자동 변환 중..."

TYPES=("$HOME_NAME" "$LIST_NAME" "$FORM_NAME" "$DETAIL_NAME")

for type in "${TYPES[@]}"; do
  # 친구의 Angular 환경 규칙: *.component.ts 대신 *.ts 로 생성됨을 확인!
  TARGET_COMP_FILE="$SRC_BASE/${DOMAIN}-${type}/${DOMAIN}-${type}.ts"
  
  if [ -f "$TARGET_COMP_FILE" ]; then
    # 맥용 sed 문법으로 정확히 해당 .ts 파일의 'export class'만 'export default class'로 변경
    sed -i '' 's/export class/export default class/g' "$TARGET_COMP_FILE"
    echo "   ↳  export default 적용 완료: ${DOMAIN}-${type}.ts ✨"
  else
    echo "   ⚠️  파일을 찾을 수 없음: ${DOMAIN}-${type}.ts"
  fi
done
# 루트 기본 콤포넌트 'export default' 변환
TARGET_COMP_FILE_ROOT="$SRC_BASE/${DOMAIN}/${DOMAIN}.ts"
  if [ -f "$TARGET_COMP_FILE_ROOT" ]; then
    # 맥용 sed 문법으로 정확히 해당 .ts 파일의 'export class'만 'export default class'로 변경
    sed -i '' 's/export class/export default class/g' "$TARGET_COMP_FILE_ROOT"
    echo "   ↳  export default 적용 완료: ${DOMAIN}.ts ✨"
  else
    echo "   ⚠️  파일을 찾을 수 없음: ${DOMAIN}.ts"
  fi

# ───────────────────────────────────────────────────────────────────────────────────

# ── 6. 공용 서비스
echo "\n📦 6. 공용 서비스"
ng g service $BASE/services/${DOMAIN}-${FORM_NAME}.service
ng g service $BASE/services/${DOMAIN}.command
ng g service $BASE/services/${DOMAIN}.config

# ── 7. routes 파일 생성
echo "\n📦 7. routes 파일 생성"
ROUTES_FILE="$SRC_BASE/${DOMAIN}.routes.ts"
mkdir -p "$SRC_BASE"

# 8. interface
mkdir -p "$SRC_BASE/interfaces"

cat > "$SRC_BASE/interfaces/i-${DOMAIN}.ts" << EOF
export interface I${DOMAIN_PASCAL}Base {
  // TODO: 필드를 채워넣으십시오! 🙏
}

export interface I${DOMAIN_PASCAL}View extends I${DOMAIN_PASCAL}Base {
  id: number;
  // TODO: 필드를 채워넣으십시오! 🙏
}
export interface I${DOMAIN_PASCAL}Payload extends I${DOMAIN_PASCAL}Base {
  id?: number;
  // TODO: 필드를 채워넣으십시오! 🙏
}
EOF

MENU_DATA="src/app/data/menu-data.ts"

# Paths 객체 마지막에 자동 삽입
sed -i '' "s|} as const satisfies|    ${DOMAIN_PASCAL}: {\n        url: '${DOMAIN_PASCAL}',\n        title: '${DOMAIN_PASCAL}',\n        ko: '',\n        hj: '',\n        en: '${DOMAIN_PASCAL}',\n        sa: '',\n        pi: '',\n        navKey: '' as NavKeyType,\n        icon: Icons.NaturePeople,\n        tooltip: '',\n    },\n} as const satisfies|" $MENU_DATA

echo "✅ menu-data.ts Paths 자동 등록 완료!"

# ✅ app.routes.buddha.ts 에 자동 추가
BUDDHA_ROUTES="src/app/app.routes.buddha.ts"

# 마지막 ] 앞에 새 라우트 삽입
sed -i '' "s|] as Routes;|    {\n        path: Paths.${DOMAIN_PASCAL}.url,\n        loadChildren: () => import('@pages/${DOMAIN}/${DOMAIN}.routes')\n    },\n] as Routes;|" $BUDDHA_ROUTES

echo "✅ app.routes.buddha.ts 자동 등록 완료!"

cat > $ROUTES_FILE << EOF
import { getTitle } from "@app/data/menu-data";
import { buildStandardRoutes } from "@app/pages/route.factor";
export default buildStandardRoutes(['${DOMAIN_PASCAL}'], getTitle);
EOF

SERVICE_FILE="$SRC_BASE/services/${DOMAIN}.service.ts"
cat > $SERVICE_FILE << EOF
import { Service } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { I${DOMAIN_PASCAL}Payload, I${DOMAIN_PASCAL}View } from '../interfaces/i-${DOMAIN}';
import { IResponse } from '@app/core/interfaces/api/i-response';
import { BaseService } from '@app/core/services/base/base.service';

@Service()
export class ${DOMAIN_PASCAL}Service extends BaseService {

  // ── READ ─────────────────────────────────
  list = httpResource<I${DOMAIN_PASCAL}View[]>( () => \`\${this.apiUrl}\`);

  // ── CREATE / UPDATE ──────────────────────
  async upsert(payload: I${DOMAIN_PASCAL}Payload, id?: number): Promise<IResponse> {
    const res = id
      ? await firstValueFrom(this.http.put<IResponse>(\`\${this.apiUrl}/Update/\${id}\`, payload))
      : await firstValueFrom(this.http.post<IResponse>(\`\${this.apiUrl}/Create\`, payload));
    if (res.isSuccess) this.list.reload();
    return res;
  }

  // ── DELETE ───────────────────────────────
  async delete(id: number): Promise<IResponse> {
    const res = await firstValueFrom(
      this.http.delete<IResponse>(\`\${this.apiUrl}/Delete/\${id}\`)
    );
    if (res.isSuccess) this.list.reload();
    return res;
  }
}
EOF

git add .
git commit -m "Create new ${DOMAIN} Templete"

echo "✅ ${DOMAIN}.service.ts 표준 템플릿 생성 완료!"

echo "\n✅ '$DOMAIN' 도메인 생성 완료!"
echo ""
echo "📁 생성된 구조:"
echo "   pages/$DOMAIN/"
echo "   ├── $DOMAIN/                       ← 부모 레이아웃 (일반 export 유지 🔒)"
echo "   ├── ${DOMAIN}-${HOME_NAME}/        ← 대시보드 (Mandala) (export default ✨)"
echo "   ├── ${DOMAIN}-${LIST_NAME}/        ← 목록 (Samsara) (export default ✨)"
echo "   ├── ${DOMAIN}-${FORM_NAME}/        ← 생성/수정 공용 (Karma) (export default ✨)"
echo "   ├── ${DOMAIN}-${DETAIL_NAME}/      ← 상세 (Vipassana) (export default ✨)"
echo "   ├── services/"
echo "   │   └── ${DOMAIN}.service.ts"
echo "   │   └── ${DOMAIN}-${FORM_NAME}.service.ts"
echo "   │   └── ${DOMAIN}-command.service.ts"
echo "   └── ${DOMAIN}.routes.ts"
echo ""
echo "🙏 부처님의 가호 아래 코드를 채워넣으십시오! 성불하십시오! 🪷"