// import './ui';

import { getCaptureImage } from '../common/image';
import { tl } from '../common/toast';
import { runWithRetry } from '../jd/211111/tasks/index';

getCaptureImage();
runWithRetry(3);

tl('结束');
