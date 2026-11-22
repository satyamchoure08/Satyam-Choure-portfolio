/**
 * VISUAL LIBRARY: one photo per concept, reused wherever that concept appears
 * (same thing = same picture, so visitors learn the flow faster).
 *
 * All photos are free under the Unsplash License (commercial use, no attribution
 * required). They are downloaded into /public/images (nothing hotlinked); `source`
 * records where each one came from.
 */
import type { StaticImageData } from "next/image";

import sunPanels from "../assets/images/steps/sun-panels.jpg";
import topconModules from "../assets/images/steps/topcon-modules.jpg";
import dcProtection from "../assets/images/steps/dc-protection.jpg";
import inverter from "../assets/images/steps/inverter.jpg";
import homeLoads from "../assets/images/steps/home-loads.jpg";
import netMeter from "../assets/images/steps/net-meter.jpg";
import utilityGrid from "../assets/images/steps/utility-grid.jpg";
import subsidyCredit from "../assets/images/steps/subsidy-credit.jpg";
import lithiumBattery from "../assets/images/steps/lithium-battery.jpg";
import switchover from "../assets/images/steps/switchover.jpg";
import nightBackup from "../assets/images/steps/night-backup.jpg";
import solarFarm from "../assets/images/steps/solar-farm.jpg";
import stepUpTransformer from "../assets/images/steps/step-up-transformer.jpg";
import compactSubstation from "../assets/images/steps/compact-substation.jpg";
import htLines from "../assets/images/steps/ht-lines.jpg";
import elevatedStructure from "../assets/images/steps/elevated-structure.jpg";
import lightningEarthing from "../assets/images/steps/lightning-earthing.jpg";
import survey from "../assets/images/steps/survey.jpg";
import design from "../assets/images/steps/design.jpg";
import installation from "../assets/images/steps/installation.jpg";
import switchOnFamily from "../assets/images/steps/switch-on-family.jpg";

import rajesh from "../assets/images/people/rajesh.jpg";
import sunita from "../assets/images/people/sunita.jpg";
import anil from "../assets/images/people/anil.jpg";
import heroRooftop from "../assets/images/hero-rooftop.jpg";

/** Hero photo (static import so the portfolio sub-path is added automatically). */
export const heroImage = heroRooftop;

export interface Visual {
  src: StaticImageData;
  alt: string;
  source: string;
}

export const visuals = {
  sunPanels: {
    src: sunPanels,
    alt: "Rooftop solar panels catching the evening sun",
    source: "https://unsplash.com/photos/black-and-white-solar-panels-0GbrjL3vZF4",
  },
  topconModules: {
    src: topconModules,
    alt: "Close-up of high-efficiency solar module cells",
    source: "https://unsplash.com/photos/a-close-up-of-a-solar-panel-on-a-building-2SfssudtyIA",
  },
  dcProtection: {
    src: dcProtection,
    alt: "Protection box with surge devices and circuit breakers",
    source: "https://unsplash.com/photos/electrical-switch-box-with-circuit-breakers-kK7uPfb2YWU",
  },
  inverter: {
    src: inverter,
    alt: "Wall-mounted solar inverter with battery units and isolators",
    source: "https://unsplash.com/photos/wall-mounted-solar-power-and-energy-storage-system-7WzD2mTRWK8",
  },
  homeLoads: {
    src: homeLoads,
    alt: "Bright living room running on solar power",
    source: "https://unsplash.com/photos/living-room-with-beige-sofas-15cXFq_G5IU",
  },
  netMeter: {
    src: netMeter,
    alt: "Row of electricity meters recording import and export",
    source: "https://unsplash.com/photos/black-and-white-electric-meter-0MKzwPmehRE",
  },
  utilityGrid: {
    src: utilityGrid,
    alt: "Power lines carrying exported units across a mustard field",
    source: "https://unsplash.com/photos/power-lines-stretch-across-a-field-of-yellow-flowers-nmrT4Xsicxo",
  },
  subsidyCredit: {
    src: subsidyCredit,
    alt: "Rupee note on a laptop, for the subsidy credited by bank transfer",
    source: "https://unsplash.com/photos/500-indian-rupee-banknote-4kIM7ED8F1A",
  },
  lithiumBattery: {
    src: lithiumBattery,
    alt: "Lithium battery module sliding into its rack",
    source: "https://unsplash.com/photos/green-and-white-plastic-box-mLxy5nt9Z90",
  },
  switchover: {
    src: switchover,
    alt: "Lights staying on during a grid power cut",
    source: "https://unsplash.com/photos/a-living-room-with-a-couch-and-a-table-kypck3JILuY",
  },
  nightBackup: {
    src: nightBackup,
    alt: "House lit up at night on battery backup",
    source: "https://unsplash.com/photos/lighted-2-storey-house-near-trees-qdexC1ISxmw",
  },
  solarFarm: {
    src: solarFarm,
    alt: "Aerial view of a megawatt-scale solar plant",
    source: "https://unsplash.com/photos/aerial-photography-of-grass-field-with-blue-solar-panels-Ilpf2eUPpUE",
  },
  stepUpTransformer: {
    src: stepUpTransformer,
    alt: "Step-up power transformer at a substation",
    source: "https://unsplash.com/photos/electrical-transformer-station-on-a-cloudy-day-CYX92RSTQUw",
  },
  compactSubstation: {
    src: compactSubstation,
    alt: "Substation equipment that feeds power into the grid",
    source: "https://unsplash.com/photos/a-lot-of-electrical-equipment-that-is-on-the-ground-jnoVECivNJU",
  },
  htLines: {
    src: htLines,
    alt: "High-tension transmission towers at sunset",
    source: "https://unsplash.com/photos/silhouette-of-electric-post-during-sunset-qpAOxji4dAo",
  },
  elevatedStructure: {
    src: elevatedStructure,
    alt: "Engineer walking under an elevated steel solar structure",
    source: "https://unsplash.com/photos/a-man-wearing-a-safety-vest-and-hard-hat-hBE96YanOlM",
  },
  lightningEarthing: {
    src: lightningEarthing,
    alt: "Lightning strike, the surge that earthing protects against",
    source: "https://unsplash.com/photos/lightning-bolt-in-dark-storm-3qucB7U2l7I",
  },
  survey: {
    src: survey,
    alt: "Solar engineer surveying a flat rooftop",
    source: "https://unsplash.com/photos/a-man-standing-on-top-of-a-roof-covered-in-solar-panels-0tVDz5Tc-SU",
  },
  design: {
    src: design,
    alt: "Engineer preparing a technical layout on a laptop",
    source: "https://unsplash.com/photos/a-man-working-on-a-laptop-computer-surrounded-by-tools-KeLUeVSplNY",
  },
  installation: {
    src: installation,
    alt: "Installer fixing solar panels in place",
    source: "https://unsplash.com/photos/a-man-in-a-hardhat-working-on-a-solar-panel-JlhvFEVMwng",
  },
  switchOnFamily: {
    src: switchOnFamily,
    alt: "Family at home after their solar system goes live",
    source: "https://unsplash.com/photos/a-family-of-five-including-a-baby-posing-F4AsoI38xTk",
  },
} satisfies Record<string, Visual>;

export type VisualKey = keyof typeof visuals;

/** Stock portraits for the sample reviews (swap for real customers before launch). */
export const people = {
  rajesh: { src: rajesh, source: "https://unsplash.com/photos/a-smiling-man-wearing-glasses-and-a-maroon-kurta-Oj_PWTQo6b8" },
  sunita: { src: sunita, source: "https://unsplash.com/photos/smiling-woman-photo-Rtu6mAZXw6g" },
  anil: { src: anil, source: "https://unsplash.com/photos/a-smiling-man-in-a-red-shirt-with-glasses-ONZ84gi7xr0" },
} as const;
