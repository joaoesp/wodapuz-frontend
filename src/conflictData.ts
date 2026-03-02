export interface ActiveConflict {
  id: string;
  name: string;
  startDate: string;
  type: string;
  countries: string[];
  summary: string;
  icon: string;
}

export const ACTIVE_CONFLICTS: ActiveConflict[] = [
  {
    id: "russia-ukraine",
    name: "Russia–Ukraine War",
    startDate: "February 2022",
    type: "Interstate War",
    countries: ["RUS", "UKR"],
    summary:
      "Russia launched a full-scale invasion of Ukraine in February 2022, escalating an eight-year conflict that began with the annexation of Crimea in 2014. The war has resulted in hundreds of thousands of casualties, displaced millions of Ukrainians, and reshaped European security architecture.",
    icon: "\u{1F4A5}",
  },
  {
    id: "israel-hamas",
    name: "Israel–Hamas War (Gaza)",
    startDate: "October 2023",
    type: "Interstate War",
    countries: ["ISR", "PSE"],
    summary:
      "Following a large-scale Hamas attack on southern Israel on October 7, 2023, Israel launched a sustained military campaign in the Gaza Strip. The conflict has caused massive civilian displacement and a severe humanitarian crisis in Gaza.",
    icon: "\u{1F4A5}",
  },
  {
    id: "israel-hezbollah",
    name: "Israel–Hezbollah Conflict",
    startDate: "October 2023",
    type: "Proxy War",
    countries: ["ISR", "LBN"],
    summary:
      "Cross-border hostilities between Israel and Hezbollah intensified sharply after October 2023, with daily exchanges of fire along the Israel-Lebanon border. The conflict escalated significantly in late 2024 with Israeli ground operations in southern Lebanon.",
    icon: "\u{1F525}",
  },
  {
    id: "sudan",
    name: "Sudan Civil War",
    startDate: "April 2023",
    type: "Civil War",
    countries: ["SDN"],
    summary:
      "Fighting erupted between the Sudanese Armed Forces and the paramilitary Rapid Support Forces in April 2023, plunging the country into a devastating civil war. The conflict has displaced over 10 million people and created one of the world's worst humanitarian crises.",
    icon: "\u{1F525}",
  },
  {
    id: "myanmar",
    name: "Myanmar Civil War",
    startDate: "February 2021",
    type: "Civil War",
    countries: ["MMR"],
    summary:
      "Following the military coup in February 2021, widespread armed resistance emerged across Myanmar. Ethnic armed organizations and newly formed People's Defense Forces have engaged the military junta, with the resistance gaining significant territorial control by 2024.",
    icon: "\u{1F525}",
  },
  {
    id: "ethiopia-tigray",
    name: "Ethiopia Instability",
    startDate: "November 2020",
    type: "Civil War",
    countries: ["ETH"],
    summary:
      "The Tigray War between Ethiopian federal forces and Tigrayan forces lasted from 2020 to 2022, resulting in hundreds of thousands of deaths. Despite a ceasefire agreement in November 2022, Ethiopia continues to face armed conflicts in the Amhara and Oromia regions.",
    icon: "\u{1F525}",
  },
  {
    id: "sahel",
    name: "Sahel Insurgency",
    startDate: "January 2012",
    type: "Insurgency",
    countries: ["MLI", "BFA", "NER"],
    summary:
      "Jihadist insurgencies linked to ISIL and al-Qaeda affiliates continue to destabilize the Sahel region. Military juntas in Mali, Burkina Faso, and Niger have expelled French forces and formed the Alliance of Sahel States while battling persistent militant threats.",
    icon: "\u{26A0}\u{FE0F}",
  },
  {
    id: "somalia",
    name: "Somalia Insurgency",
    startDate: "January 2009",
    type: "Insurgency",
    countries: ["SOM"],
    summary:
      "Al-Shabaab, an al-Qaeda-affiliated militant group, continues to wage an insurgency against the Somali federal government and African Union peacekeeping forces. The group controls significant rural territory and conducts frequent attacks on civilians and military targets.",
    icon: "\u{26A0}\u{FE0F}",
  },
  {
    id: "yemen",
    name: "Yemen Civil War",
    startDate: "September 2014",
    type: "Civil War",
    countries: ["YEM"],
    summary:
      "The Yemeni civil war between the internationally recognized government and Houthi rebels has created one of the world's worst humanitarian disasters. Houthi attacks on Red Sea shipping since late 2023 have drawn US-led military responses and disrupted global trade routes.",
    icon: "\u{1F525}",
  },
  {
    id: "syria",
    name: "Syria Civil War",
    startDate: "March 2011",
    type: "Civil War",
    countries: ["SYR"],
    summary:
      "The Syrian civil war, which began in 2011, saw a dramatic shift in late 2024 when opposition forces led by HTS rapidly advanced and captured Damascus, ending the Assad regime. The country remains fragmented with multiple armed factions and foreign military presences.",
    icon: "\u{1F525}",
  },
  {
    id: "drc-m23",
    name: "DRC–M23 Conflict",
    startDate: "November 2021",
    type: "Proxy War",
    countries: ["COD"],
    summary:
      "The M23 rebel group, backed by Rwanda, has seized large parts of eastern Democratic Republic of Congo. The conflict has displaced millions and strained relations between the DRC and Rwanda, with UN peacekeepers withdrawing from the region.",
    icon: "\u{1F525}",
  },
  {
    id: "haiti",
    name: "Haiti Gang Crisis",
    startDate: "February 2024",
    type: "Insurgency",
    countries: ["HTI"],
    summary:
      "Armed gangs control large portions of Port-au-Prince and have effectively paralyzed Haiti's government. Coordinated gang attacks in early 2024 forced the prime minister's resignation and prompted deployment of a Kenya-led multinational security mission.",
    icon: "\u{26A0}\u{FE0F}",
  },
];
