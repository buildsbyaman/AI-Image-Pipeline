const fs = require('fs');
const path = require('path');

const replacements = {
  'src/app.ts': [
    { from: /.\/middleware\/errorHandler/g, to: './core/middleware/errorHandler' },
    { from: /.\/routes\/notificationRoutes/g, to: './modules/notification/notification.routes' }
  ],
  'src/core/middleware/errorHandler.ts': [
    { from: /..\/utils\/AppError/g, to: '../../shared/utils/AppError' },
    { from: /..\/utils\/logger/g, to: '../../shared/utils/logger' }
  ],
  'src/core/middleware/validateRequest.ts': [
    { from: /..\/utils\/AppError/g, to: '../../shared/utils/AppError' }
  ],
  'src/modules/email/email.queue.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' }
  ],
  'src/modules/email/email.service.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' },
    { from: /..\/utils\/logger/g, to: '../../shared/utils/logger' }
  ],
  'src/modules/email/email.worker.ts': [
    { from: /..\/queues\/notificationQueue/g, to: './email.queue' },
    { from: /..\/services\/EmailService/g, to: './email.service' },
    { from: /..\/repositories\/NotificationRepository/g, to: '../notification/notification.repository' },
    { from: /..\/utils\/logger/g, to: '../../shared/utils/logger' }
  ],
  'src/modules/notification/notification.controller.ts': [
    { from: /..\/services\/NotificationService/g, to: './notification.service' },
    { from: /..\/utils\/AppError/g, to: '../../shared/utils/AppError' }
  ],
  'src/modules/notification/notification.routes.ts': [
    { from: /..\/controllers\/NotificationController/g, to: './notification.controller' },
    { from: /..\/middleware\/validateRequest/g, to: '../../core/middleware/validateRequest' }
  ],
  'src/modules/notification/notification.service.ts': [
    { from: /..\/repositories\/NotificationRepository/g, to: './notification.repository' },
    { from: /..\/queues\/notificationQueue/g, to: '../email/email.queue' }
  ],
  'src/modules/pipeline/pipeline.worker.ts': [
    { from: /..\/queues\/notificationQueue/g, to: '../email/email.queue' },
    { from: /..\/utils\/templateEngine/g, to: '../../shared/utils/templateEngine' },
    { from: /..\/utils\/logger/g, to: '../../shared/utils/logger' },
    { from: /..\/config\/env/g, to: '../../config/env' }
  ],
  'src/server.ts': [
    { from: /.\/utils\/logger/g, to: './shared/utils/logger' }
  ],
  'src/shared/utils/logger.ts': [
    { from: /..\/config\/env/g, to: '../../config/env' }
  ],
  'src/worker.ts': [
    { from: /.\/utils\/logger/g, to: './shared/utils/logger' },
    { from: /.\/workers\/notificationWorker/g, to: './modules/email/email.worker' },
    { from: /.\/workers\/pipelineEventsWorker/g, to: './modules/pipeline/pipeline.worker' }
  ]
};

for (const [filePath, rules] of Object.entries(replacements)) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const rule of rules) {
    content = content.replace(rule.from, rule.to);
  }
  fs.writeFileSync(fullPath, content, 'utf8');
}
