const fs = require('fs');
const path = require('path');

const replacements = {
  // src/app.routes.ts
  'src/app.routes.ts': [
    { from: /..\/modules\/auth\/auth.routes/g, to: './modules/auth/auth.routes' },
    { from: /..\/modules\/file\/file.routes/g, to: './modules/file/file.routes' },
    { from: /..\/modules\/job\/job.routes/g, to: './modules/job/job.routes' },
    { from: /..\/middleware\/proxy.middleware/g, to: './modules/notification/notification.proxy' },
    { from: /..\/middleware\/auth.middleware/g, to: './modules/auth/auth.middleware' },
    { from: /import \{ notificationProxy \} from '\.\/modules\/notification\/notification\.proxy';\nimport \{ authenticate \} from '\.\/modules\/auth\/auth\.middleware';/g, to: 'import notificationRoutes from "./modules/notification/notification.routes";' },
    { from: /router\.use\("\/notifications", authenticate, notificationProxy\);/g, to: 'router.use("/notifications", notificationRoutes);' }
  ],
  // src/app.ts
  'src/app.ts': [
    { from: /.\/middleware\/setup.middleware/g, to: './core/middleware/setup.middleware' },
    { from: /.\/middleware\/error.middleware/g, to: './core/middleware/error.middleware' },
    { from: /.\/routes/g, to: './app.routes' }
  ],
  // src/core/middleware/error.middleware.ts
  'src/core/middleware/error.middleware.ts': [
    { from: /..\/utils\/errors/g, to: '../../shared/utils/errors' },
    { from: /..\/utils\/response/g, to: '../../shared/utils/response' },
    { from: /..\/utils\/logger/g, to: '../../shared/utils/logger' },
    { from: /\(err as CustomError\)\.statusCode/g, to: 'err.statusCode' },
    { from: /\(err as any\)\.errors/g, to: 'err.errors' },
    // wait, there was a TS error about 'statusCode' does not exist on type 'Error'.
    // `const statusCode = err.statusCode || 500;` => `const customErr = err as any; const statusCode = customErr.statusCode || 500;`
  ],
  // src/core/middleware/setup.middleware.ts
  'src/core/middleware/setup.middleware.ts': [
    { from: /..\/utils\/logger/g, to: '../../shared/utils/logger' }
  ],
  // src/index.ts
  'src/index.ts': [
    { from: /.\/utils\/logger/g, to: './shared/utils/logger' },
    { from: /.\/services\/redisSubscriber/g, to: './modules/notification/notification.subscriber' }
  ],
  // src/modules/auth/auth.controller.ts
  'src/modules/auth/auth.controller.ts': [
    { from: /..\/..\/utils\/response/g, to: '../../shared/utils/response' },
    { from: /..\/..\/middleware\/auth.middleware/g, to: './auth.middleware' }
  ],
  // src/modules/auth/auth.middleware.ts
  'src/modules/auth/auth.middleware.ts': [
    { from: /..\/utils\/jwt/g, to: './jwt.util' },
    { from: /..\/utils\/errors/g, to: '../../shared/utils/errors' }
  ],
  // src/modules/auth/auth.routes.ts
  'src/modules/auth/auth.routes.ts': [
    { from: /..\/..\/middleware\/auth.middleware/g, to: './auth.middleware' }
  ],
  // src/modules/auth/auth.service.ts
  'src/modules/auth/auth.service.ts': [
    { from: /..\/..\/utils\/bcrypt/g, to: './bcrypt.util' },
    { from: /..\/..\/utils\/jwt/g, to: './jwt.util' },
    { from: /..\/..\/utils\/errors/g, to: '../../shared/utils/errors' }
  ],
  // src/modules/auth/jwt.util.ts
  'src/modules/auth/jwt.util.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' }
  ],
  // src/modules/file/file.controller.ts
  'src/modules/file/file.controller.ts': [
    { from: /..\/..\/services\/storage.service/g, to: './file.service' },
    { from: /..\/..\/utils\/response/g, to: '../../shared/utils/response' },
    { from: /..\/..\/utils\/errors/g, to: '../../shared/utils/errors' },
    { from: /..\/..\/utils\/logger/g, to: '../../shared/utils/logger' }
  ],
  // src/modules/file/file.service.ts
  'src/modules/file/file.service.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' }
  ],
  // src/modules/job/job.controller.ts
  'src/modules/job/job.controller.ts': [
    { from: /..\/..\/middleware\/auth.middleware/g, to: '../auth/auth.middleware' },
    { from: /..\/..\/services\/storage.service/g, to: '../file/file.service' },
    { from: /..\/..\/queues\/imageProcessingQueue/g, to: './job.queue' },
    { from: /..\/..\/utils\/response/g, to: '../../shared/utils/response' },
    { from: /..\/..\/utils\/errors/g, to: '../../shared/utils/errors' }
  ],
  // src/modules/job/job.queue.ts
  'src/modules/job/job.queue.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' }
  ],
  // src/modules/job/job.routes.ts
  'src/modules/job/job.routes.ts': [
    { from: /..\/..\/middleware\/auth.middleware/g, to: '../auth/auth.middleware' }
  ],
  // src/modules/notification/notification.proxy.ts
  'src/modules/notification/notification.proxy.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' }
  ],
  // src/modules/notification/notification.subscriber.ts
  'src/modules/notification/notification.subscriber.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' },
    { from: /..\/socket\/socket.service/g, to: '../../socket/socket.service' },
    { from: /..\/types\/socket.types/g, to: '../../types/socket.types' },
    { from: /..\/utils\/logger/g, to: '../../shared/utils/logger' }
  ],
  // src/shared/utils/logger.ts
  'src/shared/utils/logger.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' }
  ],
  // src/socket/index.ts
  'src/socket/index.ts': [
    { from: /..\/utils\/logger/g, to: '../shared/utils/logger' }
  ],
  // src/socket/socket.service.ts
  'src/socket/socket.service.ts': [
    { from: /..\/utils\/logger/g, to: '../shared/utils/logger' }
  ],
  // src/socket/socketAuth.ts
  'src/socket/socketAuth.ts': [
    { from: /..\/utils\/jwt/g, to: '../modules/auth/jwt.util' },
    { from: /..\/utils\/logger/g, to: '../shared/utils/logger' }
  ],
  // src/types/socket.types.ts
  'src/types/socket.types.ts': [
    { from: /..\/utils\/jwt/g, to: '../modules/auth/jwt.util' }
  ]
};

for (const [filePath, rules] of Object.entries(replacements)) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Missing file: ${fullPath}`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const rule of rules) {
    content = content.replace(rule.from, rule.to);
  }
  
  // Specific fix for error.middleware.ts TS errors
  if (filePath === 'src/core/middleware/error.middleware.ts') {
    content = content.replace('const statusCode = err.statusCode || 500;', 'const customErr = err as any;\n  const statusCode = customErr.statusCode || 500;');
    content = content.replace('errors: err.errors,', 'errors: customErr.errors,');
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}
