#!/bin/sh
# 主义星图 · macOS / Linux 一键启动
cd "$(dirname "$0")" || exit 1

if [ ! -f index.html ]; then
  echo "  [x] 没找到 index.html，请在项目根目录运行"
  exit 1
fi

PORT=8787
while lsof -i ":$PORT" >/dev/null 2>&1; do
  PORT=$((PORT + 1))
  if [ "$PORT" -gt 8820 ]; then
    echo "  [x] 8787-8820 都被占用了"
    exit 1
  fi
done

echo ""
echo "  主义星图 · Ism Atlas"
echo "  ------------------------------------"
echo "  地址   http://127.0.0.1:$PORT/"
echo "  Ctrl+C 停止服务"
echo ""

(
  sleep 2
  if command -v open >/dev/null 2>&1; then
    open "http://127.0.0.1:$PORT/"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://127.0.0.1:$PORT/"
  fi
) &

if command -v python3 >/dev/null 2>&1; then
  echo "  [服务] Python 3"
  echo ""
  python3 -m http.server "$PORT" --bind 127.0.0.1
elif command -v python >/dev/null 2>&1; then
  echo "  [服务] Python"
  echo ""
  python -m http.server "$PORT" --bind 127.0.0.1
elif command -v node >/dev/null 2>&1; then
  echo "  [服务] Node.js"
  echo ""
  node tools/serve.js "$PORT"
else
  echo "  [!] 没检测到 Python 或 Node，直接打开文件"
  if command -v open >/dev/null 2>&1; then open index.html
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open index.html
  fi
fi
