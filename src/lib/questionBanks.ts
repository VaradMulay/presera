import type { Question, Role } from './types';

// Predefined question banks — no AI required. Each role has 15+ realistic
// questions across Technical / HR / Behavioral / Problem Solving categories
// so the engine can serve unique questions per session.
//
// idealKeywords bias the local scorer (keyword overlap) — they are never
// shown to the candidate.

const q = (
  role: Role,
  id: string,
  category: Question['category'],
  text: string,
  idealKeywords: string[],
): Question => ({ id, role, category, text, idealKeywords });

export const QUESTION_BANKS: Record<Exclude<Role, 'Other'>, Question[]> = {
  'Software Developer': [
    q('Software Developer', 'sd-1', 'Technical', 'Explain the difference between an array and a linked list. When would you choose one over the other?', ['array', 'linked list', 'memory', 'contiguous', 'insertion', 'access', 'pointer']),
    q('Software Developer', 'sd-2', 'Technical', 'What is the time complexity of binary search and what pre-condition must the data satisfy?', ['binary search', 'sorted', 'log n', 'logarithmic', 'divide', 'conquer']),
    q('Software Developer', 'sd-3', 'Technical', 'Describe how a hash table works and how it handles collisions.', ['hash', 'bucket', 'collision', 'chaining', 'probing', 'key', 'value', 'hash function']),
    q('Software Developer', 'sd-4', 'Technical', 'What is the difference between abstraction and encapsulation in OOP?', ['abstraction', 'encapsulation', 'interface', 'implementation', 'hide', 'class']),
    q('Software Developer', 'sd-5', 'Technical', 'Explain the concept of Big O notation and why it matters.', ['big o', 'complexity', 'upper bound', 'scalability', 'time', 'worst']),
    q('Software Developer', 'sd-6', 'Problem Solving', 'Given an array of integers, how would you find the two numbers that sum to a target?', ['hash map', 'two pointer', 'complement', 'nested loop', 'target', 'sum']),
    q('Software Developer', 'sd-7', 'Problem Solving', 'How would you detect a cycle in a linked list?', ['floyd', 'tortoise', 'hare', 'fast', 'slow', 'pointer', 'visited']),
    q('Software Developer', 'sd-8', 'Problem Solving', 'Describe an algorithm to reverse a string without using built-in reverse functions.', ['two pointer', 'swap', 'iterate', 'stack', 'characters']),
    q('Software Developer', 'sd-9', 'Technical', 'What is the difference between SQL and NoSQL databases? Give examples of each.', ['sql', 'nosql', 'relational', 'document', 'schema', 'mongo', 'postgres', 'scaling']),
    q('Software Developer', 'sd-10', 'Technical', 'Explain what a REST API is and the difference between GET, POST, PUT, and DELETE.', ['rest', 'get', 'post', 'put', 'delete', 'resource', 'http', 'stateless']),
    q('Software Developer', 'sd-11', 'Technical', 'What is the difference between processes and threads?', ['process', 'thread', 'memory', 'cpu', 'context switch', 'concurrent', 'shared']),
    q('Software Developer', 'sd-12', 'Technical', 'How does garbage collection work in languages like Java or Go?', ['garbage', 'mark', 'sweep', 'memory', 'unreachable', 'reference', 'collect']),
    q('Software Developer', 'sd-13', 'Behavioral', 'Tell me about a time you had to learn a new technology quickly for a project.', ['learn', 'project', 'adapt', 'documentation', 'deadline', 'challenge']),
    q('Software Developer', 'sd-14', 'HR', 'Why do you want to work as a software developer at our company?', ['company', 'growth', 'impact', 'values', 'products', 'mission']),
    q('Software Developer', 'sd-15', 'Behavioral', 'Describe a bug that was difficult to find. How did you debug it?', ['debug', 'bug', 'logging', 'reproduce', 'root cause', 'isolate']),
    q('Software Developer', 'sd-16', 'Behavioral', 'Tell me about a time you disagreed with a teammate on a technical decision. How did you resolve it?', ['disagree', 'discuss', 'data', 'compromise', 'team', 'respect']),
    q('Software Developer', 'sd-17', 'HR', 'Where do you see yourself in five years?', ['five years', 'growth', 'lead', 'specialize', 'impact', 'goals']),
  ],

  'Frontend Developer': [
    q('Frontend Developer', 'fe-1', 'Technical', 'Explain the difference between controlled and uncontrolled components in React.', ['controlled', 'uncontrolled', 'state', 'refs', 'input', 'dom', 'onChange']),
    q('Frontend Developer', 'fe-2', 'Technical', 'What is the virtual DOM and how does React use it for rendering?', ['virtual dom', 'diff', 'reconcile', 'render', 'tree', 'batch']),
    q('Frontend Developer', 'fe-3', 'Technical', 'Explain the CSS box model and the difference between margin and padding.', ['box model', 'margin', 'padding', 'border', 'content', 'space']),
    q('Frontend Developer', 'fe-4', 'Technical', 'What is the difference between useEffect and useLayoutEffect?', ['useEffect', 'useLayoutEffect', 'paint', 'dom', 'synchronous', 'commit']),
    q('Frontend Developer', 'fe-5', 'Technical', 'How does CSS specificity work? Order the selectors by specificity.', ['specificity', 'id', 'class', 'inline', 'important', 'selector']),
    q('Frontend Developer', 'fe-6', 'Problem Solving', 'How would you optimize the performance of a large React list rendering thousands of items?', ['virtualization', 'windowing', 'memo', 'key', 'pagination', 'lazy', 'render']),
    q('Frontend Developer', 'fe-7', 'Problem Solving', 'A page layout breaks on mobile but works on desktop. How do you debug it?', ['devtools', 'responsive', 'viewport', 'breakpoint', 'media query', 'inspect']),
    q('Frontend Developer', 'fe-8', 'Problem Solving', 'How would you implement a debounced search input in React?', ['debounce', 'setTimeout', 'cleanup', 'useEffect', 'delay', 'input']),
    q('Frontend Developer', 'fe-9', 'Technical', 'What are React keys and why are they important when rendering lists?', ['key', 'list', 'reconcile', 'identity', 'unique', 'warning']),
    q('Frontend Developer', 'fe-10', 'Technical', 'Explain the difference between rem, em, and px units in CSS.', ['rem', 'em', 'px', 'root', 'relative', 'accessibility']),
    q('Frontend Developer', 'fe-11', 'Technical', 'What is the difference between sessionStorage, localStorage, and cookies?', ['sessionstorage', 'localstorage', 'cookie', 'persist', 'tab', 'size', 'http']),
    q('Frontend Developer', 'fe-12', 'Technical', 'Explain flexbox and when you would use it over CSS grid.', ['flexbox', 'grid', 'axis', 'align', 'justify', 'one dimensional', 'two dimensional']),
    q('Frontend Developer', 'fe-13', 'Behavioral', 'Tell me about a frontend feature you are proud of building.', ['feature', 'proud', 'built', 'impact', 'challenge', 'user']),
    q('Frontend Developer', 'fe-14', 'HR', 'Why did you choose frontend development as a career?', ['frontend', 'career', 'user', 'visual', 'impact', 'passion']),
    q('Frontend Developer', 'fe-15', 'Behavioral', 'Describe a time you improved the accessibility or UX of a product.', ['accessibility', 'ux', 'aria', 'contrast', 'keyboard', 'improve']),
    q('Frontend Developer', 'fe-16', 'Behavioral', 'How do you stay current with rapidly changing frontend frameworks?', ['learn', 'docs', 'community', 'blog', 'practice', 'curious']),
  ],

  'Backend Developer': [
    q('Backend Developer', 'be-1', 'Technical', 'Explain the difference between authentication and authorization.', ['authentication', 'authorization', 'identity', 'permissions', 'token', 'session']),
    q('Backend Developer', 'be-2', 'Technical', 'What is the difference between horizontal and vertical scaling?', ['horizontal', 'vertical', 'scale', 'instances', 'resources', 'machine']),
    q('Backend Developer', 'be-3', 'Technical', 'Explain database indexing and when it can hurt performance.', ['index', 'b-tree', 'query', 'write', 'overhead', 'lookup']),
    q('Backend Developer', 'be-4', 'Technical', 'What is a REST API and how does it differ from GraphQL?', ['rest', 'graphql', 'endpoint', 'overfetching', 'schema', 'resource']),
    q('Backend Developer', 'be-5', 'Technical', 'Explain the ACID properties in database transactions.', ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'transaction']),
    q('Backend Developer', 'be-6', 'Problem Solving', 'How would you design a URL shortener service like bit.ly?', ['hash', 'base62', 'collision', 'database', 'cache', 'redirect', 'unique']),
    q('Backend Developer', 'be-7', 'Problem Solving', 'How would you handle a sudden spike in traffic to an API endpoint?', ['cache', 'rate limit', 'queue', 'autoscale', 'cdn', 'load balancer']),
    q('Backend Developer', 'be-8', 'Problem Solving', 'A query is slow in production. How do you diagnose and fix it?', ['explain', 'index', 'query plan', 'n+1', 'cache', 'profiling']),
    q('Backend Developer', 'be-9', 'Technical', 'What is JWT and how is it used for authentication?', ['jwt', 'token', 'signature', 'payload', 'header', 'stateless', 'verify']),
    q('Backend Developer', 'be-10', 'Technical', 'Explain the difference between a monolith and microservices architecture.', ['monolith', 'microservices', 'deploy', 'scaling', 'coupling', 'service']),
    q('Backend Developer', 'be-11', 'Technical', 'What is a message queue and when would you use one?', ['queue', 'async', 'broker', 'kafka', 'rabbitmq', 'decouple', 'throughput']),
    q('Backend Developer', 'be-12', 'Technical', 'How does connection pooling improve backend performance?', ['connection pool', 'reuse', 'overhead', 'database', 'latency', 'concurrent']),
    q('Backend Developer', 'be-13', 'Behavioral', 'Tell me about a backend system you designed or contributed to.', ['system', 'designed', 'scale', 'challenge', 'component', 'team']),
    q('Backend Developer', 'be-14', 'HR', 'Why are you interested in backend engineering?', ['backend', 'logic', 'data', 'scale', 'performance', 'interest']),
    q('Backend Developer', 'be-15', 'Behavioral', 'Describe a production incident you handled. What was your role?', ['incident', 'production', 'debug', 'rollback', 'postmortem', 'role']),
    q('Backend Developer', 'be-16', 'Behavioral', 'How do you ensure code quality in a team backend codebase?', ['review', 'test', 'ci', 'lint', 'standards', 'documentation']),
  ],

  'Full Stack Developer': [
    q('Full Stack Developer', 'fs-1', 'Technical', 'Explain how a request flows from the browser to the database in a full stack app.', ['request', 'browser', 'server', 'route', 'controller', 'database', 'response']),
    q('Full Stack Developer', 'fs-2', 'Technical', 'What is the difference between client-side and server-side rendering?', ['client', 'server', 'render', 'seo', 'hydration', 'initial', 'load']),
    q('Full Stack Developer', 'fs-3', 'Technical', 'How do you manage state across frontend and backend in a React + Node app?', ['state', 'api', 'context', 'redux', 'cache', 'sync', 'database']),
    q('Full Stack Developer', 'fs-4', 'Technical', 'Explain CORS and why it matters for web security.', ['cors', 'origin', 'header', 'browser', 'cross origin', 'policy']),
    q('Full Stack Developer', 'fs-5', 'Technical', 'What is the difference between SQL and NoSQL, and when would you pick each?', ['sql', 'nosql', 'relational', 'document', 'schema', 'scale', 'consistency']),
    q('Full Stack Developer', 'fs-6', 'Problem Solving', 'How would you design a simple blog app with posts, comments, and users?', ['schema', 'posts', 'comments', 'users', 'auth', 'api', 'relation']),
    q('Full Stack Developer', 'fs-7', 'Problem Solving', 'How would you implement real-time notifications across a full stack app?', ['websocket', 'sse', 'polling', 'push', 'event', 'channel']),
    q('Full Stack Developer', 'fs-8', 'Problem Solving', 'A user reports a slow page. How do you profile it end-to-end?', ['network', 'profiler', 'query', 'render', 'cache', 'devtools', 'latency']),
    q('Full Stack Developer', 'fs-9', 'Technical', 'Explain how JWT authentication works across frontend and backend.', ['jwt', 'token', 'login', 'verify', 'header', 'storage', 'refresh']),
    q('Full Stack Developer', 'fs-10', 'Technical', 'What is an ORM and what are its trade-offs vs raw SQL?', ['orm', 'sql', 'abstraction', 'migration', 'performance', 'raw', 'model']),
    q('Full Stack Developer', 'fs-11', 'Technical', 'How do you handle environment variables and secrets in a full stack project?', ['env', 'secret', 'dotenv', 'config', 'server', 'expose']),
    q('Full Stack Developer', 'fs-12', 'Technical', 'Explain the role of a CDN in a full stack deployment.', ['cdn', 'cache', 'edge', 'static', 'latency', 'assets']),
    q('Full Stack Developer', 'fs-13', 'Behavioral', 'Tell me about a full feature you built end-to-end.', ['feature', 'end to end', 'built', 'frontend', 'backend', 'database']),
    q('Full Stack Developer', 'fs-14', 'HR', 'Why do you want to work as a full stack developer?', ['full stack', 'versatile', 'impact', 'end to end', 'interest']),
    q('Full Stack Developer', 'fs-15', 'Behavioral', 'Describe a time you had to balance frontend and backend priorities.', ['balance', 'priority', 'tradeoff', 'deadline', 'team']),
    q('Full Stack Developer', 'fs-16', 'Behavioral', 'How do you keep both frontend and backend skills sharp?', ['learn', 'practice', 'projects', 'curious', 'balance']),
  ],

  'Python Developer': [
    q('Python Developer', 'py-1', 'Technical', 'Explain the difference between a list and a tuple in Python.', ['list', 'tuple', 'mutable', 'immutable', 'syntax', 'use']),
    q('Python Developer', 'py-2', 'Technical', 'What is a decorator in Python and how does it work?', ['decorator', 'function', 'wrapper', 'argument', 'syntax', 'closure']),
    q('Python Developer', 'py-3', 'Technical', 'Explain the difference between deep and shallow copy.', ['deep', 'shallow', 'copy', 'reference', 'nested', 'object']),
    q('Python Developer', 'py-4', 'Technical', 'What are list comprehensions and why are they useful?', ['list comprehension', 'concise', 'iterate', 'filter', 'expression', 'readable']),
    q('Python Developer', 'py-5', 'Technical', 'Explain how Python handles memory management and garbage collection.', ['reference', 'counting', 'garbage', 'gc', 'memory', 'cyclic']),
    q('Python Developer', 'py-6', 'Problem Solving', 'How would you reverse a dictionary mapping values to keys in Python?', ['dict', 'reverse', 'items', 'comprehension', 'duplicate']),
    q('Python Developer', 'py-7', 'Problem Solving', 'Write an approach to find duplicate elements in a list efficiently.', ['set', 'seen', 'duplicate', 'hash', 'iterate', 'counter']),
    q('Python Developer', 'py-8', 'Problem Solving', 'How would you flatten a nested list of arbitrary depth?', ['flatten', 'recursion', 'isinstance', 'nested', 'iterate', 'list']),
    q('Python Developer', 'py-9', 'Technical', 'What is the difference between is and == in Python?', ['is', '==', 'identity', 'equality', 'reference', 'value']),
    q('Python Developer', 'py-10', 'Technical', 'Explain the GIL and its impact on multithreaded Python programs.', ['gil', 'global interpreter lock', 'thread', 'cpu', 'concurrent', 'release']),
    q('Python Developer', 'py-11', 'Technical', 'What are *args and **kwargs and when do you use them?', ['args', 'kwargs', 'variadic', 'keyword', 'function', 'unpack']),
    q('Python Developer', 'py-12', 'Technical', 'Explain the difference between a generator and a list.', ['generator', 'yield', 'lazy', 'iterator', 'memory', 'list']),
    q('Python Developer', 'py-13', 'Behavioral', 'Tell me about a Python project you are proud of.', ['project', 'proud', 'built', 'python', 'challenge', 'impact']),
    q('Python Developer', 'py-14', 'HR', 'Why did you choose Python as your primary language?', ['python', 'readable', 'ecosystem', 'versatile', 'community', 'interest']),
    q('Python Developer', 'py-15', 'Behavioral', 'Describe a time you optimized slow Python code.', ['optimize', 'profile', 'bottleneck', 'algorithm', 'cProfile', 'improve']),
    q('Python Developer', 'py-16', 'Behavioral', 'How do you keep up with new Python features and best practices?', ['pep', 'release', 'learn', 'community', 'docs', 'practice']),
  ],

  'Java Developer': [
    q('Java Developer', 'jv-1', 'Technical', 'Explain the four pillars of OOP and how Java supports them.', ['encapsulation', 'inheritance', 'polymorphism', 'abstraction', 'class', 'interface']),
    q('Java Developer', 'jv-2', 'Technical', 'What is the difference between an abstract class and an interface in Java?', ['abstract', 'interface', 'method', 'inherit', 'multiple', 'default']),
    q('Java Developer', 'jv-3', 'Technical', 'Explain how the JVM, JDK, and JRE differ.', ['jvm', 'jdk', 'jre', 'runtime', 'compiler', 'bytecode', 'platform']),
    q('Java Developer', 'jv-4', 'Technical', 'What is the difference between == and .equals() in Java?', ['==', 'equals', 'reference', 'value', 'object', 'string']),
    q('Java Developer', 'jv-5', 'Technical', 'Explain the Java Collections Framework and the main interfaces.', ['list', 'set', 'map', 'collection', 'queue', 'arraylist', 'hashmap']),
    q('Java Developer', 'jv-6', 'Problem Solving', 'How would you reverse a string in Java without using StringBuilder.reverse()?', ['char', 'array', 'loop', 'swap', 'two pointer', 'recursion']),
    q('Java Developer', 'jv-7', 'Problem Solving', 'How would you find the first non-repeated character in a string?', ['linkedhashmap', 'hashmap', 'count', 'iterate', 'frequency', 'character']),
    q('Java Developer', 'jv-8', 'Problem Solving', 'How do you handle concurrency in Java?', ['thread', 'synchronized', 'lock', 'concurrent', 'executor', 'atomic', 'race']),
    q('Java Developer', 'jv-9', 'Technical', 'What is the difference between HashMap and ConcurrentHashMap?', ['concurrenthashmap', 'hashmap', 'thread', 'synchronized', 'segment', 'safe']),
    q('Java Developer', 'jv-10', 'Technical', 'Explain checked vs unchecked exceptions in Java.', ['checked', 'unchecked', 'exception', 'runtime', 'throws', 'try', 'catch']),
    q('Java Developer', 'jv-11', 'Technical', 'What are generics in Java and why are they useful?', ['generics', 'type', 'parameter', 'compile', 'safety', 'cast']),
    q('Java Developer', 'jv-12', 'Technical', 'Explain the Java memory model and garbage collection basics.', ['heap', 'stack', 'garbage', 'generational', 'memory', 'collect']),
    q('Java Developer', 'jv-13', 'Behavioral', 'Tell me about a Java application you built or contributed to.', ['java', 'application', 'built', 'team', 'challenge', 'impact']),
    q('Java Developer', 'jv-14', 'HR', 'Why do you prefer Java as your primary language?', ['java', 'ecosystem', 'enterprise', 'performance', 'platform', 'interest']),
    q('Java Developer', 'jv-15', 'Behavioral', 'Describe a time you fixed a difficult Java bug.', ['bug', 'debug', 'stacktrace', 'root cause', 'fix', 'isolate']),
    q('Java Developer', 'jv-16', 'Behavioral', 'How do you write thread-safe Java code?', ['synchronized', 'concurrent', 'immutable', 'lock', 'volatile', 'atomic', 'race']),
  ],

  'Data Analyst': [
    q('Data Analyst', 'da-1', 'Technical', 'Explain the difference between INNER JOIN and LEFT JOIN in SQL.', ['inner join', 'left join', 'match', 'null', 'table', 'rows']),
    q('Data Analyst', 'da-2', 'Technical', 'What is the difference between GROUP BY and ORDER BY?', ['group by', 'order by', 'aggregate', 'sort', 'having', 'clause']),
    q('Data Analyst', 'da-3', 'Technical', 'Explain the difference between mean, median, and mode and when each is useful.', ['mean', 'median', 'mode', 'average', 'outlier', 'distribution', 'central tendency']),
    q('Data Analyst', 'da-4', 'Technical', 'What are window functions in SQL and when would you use them?', ['window', 'over', 'partition', 'rank', 'row_number', 'aggregate', 'order']),
    q('Data Analyst', 'da-5', 'Technical', 'Explain the difference between correlation and causation.', ['correlation', 'causation', 'relationship', 'variable', 'cause', 'confounding']),
    q('Data Analyst', 'da-6', 'Problem Solving', 'A dataset has missing values. How do you handle them?', ['missing', 'impute', 'mean', 'median', 'drop', 'outlier', 'na']),
    q('Data Analyst', 'da-7', 'Problem Solving', 'How would you identify outliers in a dataset?', ['outlier', 'iqr', 'zscore', 'boxplot', 'standard deviation', 'threshold']),
    q('Data Analyst', 'da-8', 'Problem Solving', 'How would you write a SQL query to find the top 3 customers by total sales?', ['order by', 'sum', 'group by', 'limit', 'top', 'sales', 'customer']),
    q('Data Analyst', 'da-9', 'Technical', 'What is a primary key and a foreign key in a relational database?', ['primary key', 'foreign key', 'unique', 'reference', 'relation', 'integrity']),
    q('Data Analyst', 'da-10', 'Technical', 'Explain what normalization means and the first three normal forms.', ['normalization', 'normal form', 'redundancy', 'dependency', 'table', 'anomaly']),
    q('Data Analyst', 'da-11', 'Technical', 'What is the difference between a bar chart and a histogram?', ['bar chart', 'histogram', 'categorical', 'continuous', 'bins', 'frequency']),
    q('Data Analyst', 'da-12', 'Technical', 'Explain what A/B testing is and how you would measure its result.', ['a/b test', 'control', 'variant', 'significance', 'p-value', 'hypothesis', 'metric']),
    q('Data Analyst', 'da-13', 'Behavioral', 'Tell me about a data analysis project that drove a business decision.', ['project', 'analysis', 'insight', 'business', 'decision', 'impact']),
    q('Data Analyst', 'da-14', 'HR', 'Why are you interested in data analysis as a career?', ['data', 'insight', 'story', 'business', 'impact', 'interest']),
    q('Data Analyst', 'da-15', 'Behavioral', 'Describe a time your analysis contradicted an assumption. How did you communicate it?', ['analysis', 'contradict', 'assumption', 'communicate', 'stakeholder', 'evidence']),
    q('Data Analyst', 'da-16', 'Behavioral', 'How do you ensure the quality and accuracy of your analysis?', ['validate', 'clean', 'document', 'peer review', 'reproducible', 'check']),
  ],

  'QA Engineer': [
    q('QA Engineer', 'qa-1', 'Technical', 'Explain the difference between manual testing and automated testing.', ['manual', 'automated', 'script', 'repeatable', 'regression', 'speed']),
    q('QA Engineer', 'qa-2', 'Technical', 'What is the difference between smoke testing and regression testing?', ['smoke', 'regression', 'critical', 'build', 'change', 'verify']),
    q('QA Engineer', 'qa-3', 'Technical', 'Explain the bug life cycle from discovery to closure.', ['new', 'assigned', 'open', 'fixed', 'retest', 'closed', 'reopen', 'status']),
    q('QA Engineer', 'qa-4', 'Technical', 'What is the difference between black-box and white-box testing?', ['black box', 'white box', 'internal', 'structure', 'input', 'output', 'code']),
    q('QA Engineer', 'qa-5', 'Technical', 'Explain what a test case and a test scenario are, and how they differ.', ['test case', 'test scenario', 'steps', 'expected', 'condition', 'high level']),
    q('QA Engineer', 'qa-6', 'Problem Solving', 'How would you test a login page end-to-end?', ['login', 'valid', 'invalid', 'empty', 'security', 'session', 'edge']),
    q('QA Engineer', 'qa-7', 'Problem Solving', 'A bug cannot be reproduced. How do you handle it?', ['reproduce', 'steps', 'logs', 'environment', 'report', 'intermittent']),
    q('QA Engineer', 'qa-8', 'Problem Solving', 'How do you decide what to automate vs test manually?', ['repeatable', 'regression', 'roi', 'stable', 'complex', 'cost', 'frequency']),
    q('QA Engineer', 'qa-9', 'Technical', 'What is API testing and how does it differ from UI testing?', ['api', 'ui', 'endpoint', 'status', 'payload', 'response', 'backend']),
    q('QA Engineer', 'qa-10', 'Technical', 'Explain boundary value analysis and equivalence partitioning.', ['boundary', 'equivalence', 'partition', 'edge', 'valid', 'invalid', 'range']),
    q('QA Engineer', 'qa-11', 'Technical', 'What tools have you used for test automation? Describe your approach.', ['selenium', 'cypress', 'playwright', 'framework', 'locator', 'assertion']),
    q('QA Engineer', 'qa-12', 'Technical', 'What is a test plan and what does it typically include?', ['scope', 'objective', 'resources', 'schedule', 'risk', 'environment', 'strategy']),
    q('QA Engineer', 'qa-13', 'Behavioral', 'Tell me about a critical bug you found before release.', ['critical', 'bug', 'release', 'impact', 'found', 'prevent']),
    q('QA Engineer', 'qa-14', 'HR', 'Why did you choose QA engineering as a career?', ['quality', 'detail', 'user', 'prevent', 'interest', 'impact']),
    q('QA Engineer', 'qa-15', 'Behavioral', 'Describe a time a developer disagreed your report was a bug.', ['disagree', 'priority', 'severity', 'discuss', 'evidence', 'reproduce', 'team']),
    q('QA Engineer', 'qa-16', 'Behavioral', 'How do you ensure test coverage for a large application?', ['coverage', 'traceability', 'matrix', 'requirement', 'risk', 'prioritize']),
  ],
};

export function getQuestionsForRole(role: Role): Question[] {
  if (role === 'Other') {
    // Aggregate a general-purpose bank from all roles for the "Other" option.
    return Object.values(QUESTION_BANKS).flat();
  }
  return QUESTION_BANKS[role] ?? [];
}

export function getAvailableRoles(): Role[] {
  return Object.keys(QUESTION_BANKS) as Role[];
}
