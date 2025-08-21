import { app } from "./app";
import { env } from "./congfig/env";

const port = env.PORT;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
