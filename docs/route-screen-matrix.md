# Route to Stitch screen matrix

The first implementation pass uses these Google Stitch anchors from project
`17938384094661492360`.

| Route            | Workspace         | Stitch anchor                      | Current state     |
| ---------------- | ----------------- | ---------------------------------- | ----------------- |
| `/login`         | Authentication    | `7268c1f30b2342daa61d3b87c1ec8721` | Base screen       |
| `/register`      | Authentication    | `n/a`                              | Base screen       |
| `/`              | End user          | `ef4c466e8965416c99eabafbdbe2a39f` | Base screen       |
| `/chat`          | End user          | `323d4166a5854b3ca200cd7357dfa3c6` | Base screen       |
| `/knowledge`     | End user          | `46046eae14784c02aa9a35657186571c` | Route placeholder |
| `/tickets`       | End user          | `b7c93ff66cd8470c859b81c688b1ead4` | Route placeholder |
| `/notifications` | End user          | `fa833c722f6f4cfdae33394d43174f2e` | Route placeholder |
| `/profile`       | End user          | `46a2dd3b8b0441bdac0e8dcdf04c4776` | Route placeholder |
| `/ingester`      | Document Ingester | `7e6045d15b9b4949b3c1a3d03c516ffa` | Base screen       |
| `/admin`         | System Admin      | `1ee7952c64334297a099ab6bbeff3624` | Base screen       |

Nested staff routes currently render explicit workspace placeholders. They can
be replaced one workflow at a time without changing either shell.

`/auth/login` is retained as a legacy alias and redirects to `/login`.
`/auth/register` redirects to `/register`.
