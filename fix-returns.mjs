import fs from 'fs';

function replaceReturns(file, oldStr, newStr) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replaceAll(`return NextResponse.json(${oldStr});`, `return NextResponse.json({ ${newStr}: ${oldStr} });`);
  fs.writeFileSync(file, content, 'utf8');
}

replaceReturns('src/app/api/admin/classes/route.ts', 'DEMO_BATCHES', 'batches');
replaceReturns('src/app/api/admin/community/route.ts', 'DEMO_GROUPS', 'groups');
replaceReturns('src/app/api/admin/subscriptions/route.ts', 'DEMO_SUBSCRIPTIONS', 'subscriptions');

console.log("Fixed classes, community, subscriptions");
