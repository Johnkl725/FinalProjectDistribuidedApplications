import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import renewalRoutes from "./routes/renewal.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.use("/renewals", renewalRoutes);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`Renewal Service listening on port ${PORT}`);
});

// Background sweep every 5 minutes
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
import { RenewalService } from "./services/renewal.service";
const renewalService = new RenewalService();
setInterval(async () => {
  try {
    const result = await renewalService.runSweep();
    console.log(
      `[renewals] sweep -> processed=${result.processed} sent=${result.sent} (${new Date().toISOString()})`
    );
  } catch (err) {
    console.error("[renewals] sweep error", err);
  }
}, SWEEP_INTERVAL_MS);

