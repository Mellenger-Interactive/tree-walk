// Chapter content for each stop, from "C&W Campus Tree Tour" by Oliver McDermott
// (UBC Urban Forestry Student). `stop` matches the `tour_stop` property on each tree in map.glb.

export const TREES = [
  {
    stop: 1,
    name: "London plane",
    latin: "Platanus × acerifolia",
    origin: "England",
    observe: [
      ["Bark", "Flakes off in pieces and is a cream colour, making it look like camouflage for a cappuccino."],
      ["Leaves", "Resemble maple leaves, which is often what it is misidentified as."],
      ["Fruit", "Clusters of many individual seeds, each from an individual flower, tightly packed together."],
    ],
    fun: [
      "London plane trees are a hybrid of Platanus orientalis from Southern Europe and Platanus occidentalis from North America. These species are thought to have hybridized in a garden in Oxford; however, some trace its origin to Spain, which is why it also has the scientific name Platanus × hispanica.",
      "There are many of these trees on the C&W campus. Look out for others on this walk!",
    ],
  },
  {
    stop: 2,
    name: "Cherry blossom tree",
    latin: "Prunus serrulata",
    origin: "Japan, China, Korea",
    observe: [
      ["Bark", "Varies depending on the variety. Can be rough with thick grooves, or papery."],
      ["Leaves", "Medium to dark green with serrated edges and a pointy (acuminate) tip."],
      ["Flowers", "During cherry blossom season they are fluffy and pink."],
    ],
    fun: [
      "In most cities, cherry trees are sterile: they produce pollen but not fruit. This reduces the mess fruit causes when dropped and limits food sources for pest species. These trees are usually also grafted, which means the branches and the trunk are from different trees that have been connected.",
    ],
  },
  {
    stop: 3,
    name: "Northern catalpa",
    latin: "Catalpa speciosa",
    origin: "Eastern North America",
    observe: [
      ["Bark", "Heavily ridged, with vertical channels."],
      ["Leaves", "Very large and lime green in colour."],
      ["Fruit", "Looks like long legumes but, interestingly, is classified as capsules."],
    ],
    fun: [
      "With large soft leaves and long legume-like fruits, it is very easy to identify. This tree also has a whorled leaf arrangement instead of the much more common opposite or alternate arrangement.",
      "Fishermen seek out this tree to find the catalpa moth caterpillar, one of the best live baits, giving the tree the common names worm tree and bait tree.",
    ],
  },
  {
    stop: 4,
    name: "Copper beech",
    latin: "Fagus sylvatica ‘Purpurea’",
    origin: "Europe",
    observe: [
      ["Bark", "Smooth and grey with specks of white that look like paint splatter."],
      ["Leaves", "Purple in mid-summer to fall, with hairs (pubescent) on the margins and underside."],
      ["Buds", "Very long, slender and pointy on the tips of branches."],
    ],
    fun: [
      "This tree is a cultivar of European beech and is distinctive because of its copper or purple foliage. This mutation of the European beech was first noted in 1690 in a forest in Germany. 99% of all copper beeches in the world are thought to be descendants of that tree.",
      "Later on in the walk you will see an example of the regular European beech!",
    ],
  },
  {
    stop: 5,
    name: "Deodar cedar",
    latin: "Cedrus deodara",
    origin: "Western Himalayas",
    observe: [
      ["Bark", "Grey and scaly."],
      ["Needles", "In bunches, giving it a dark green tufted look."],
      ["Cones", "Vertically oriented on the tree. Only the cone scales fall off, not the whole cone."],
    ],
    fun: [
      "Deodar cedar is one of three true cedars that exist. The group of plants that includes red and yellow cedar are not true cedars. This tree also has interesting cones that look like vertical duck eggs on its branches.",
    ],
  },
  {
    stop: 6,
    name: "English oak",
    latin: "Quercus robur",
    origin: "Europe, West Asia",
    observe: [
      ["Bark", "Grey and fissured, often covered in moss."],
      ["Leaves", "Rounded, lobed shape with different shades of green on the top and bottom."],
      ["Acorns", "At the end of long stalks coming off the branches."],
    ],
    fun: [
      "English oaks have been among the most common trees across Europe for a long time. Because of this they have had many uses, such as leather tanning from the bark, flour from acorns, druid medicine, wedding ceremonies and strong timber.",
    ],
  },
  {
    stop: 7,
    name: "Narrow-leaved ash",
    latin: "Fraxinus angustifolia",
    origin: "Mediterranean",
    observe: [
      ["Bark", "Smooth and grey, with cracks as it ages and stretches."],
      ["Leaves", "Compound, with 7 to 11 leaflets."],
      ["Buds", "Small and round, and look like bits of chocolate."],
    ],
    fun: [
      "Narrow-leaved ash looks very soft because of its foliage and has beautiful colour gradients in spring and fall. However, it is considered a “weed” in some parts of the world, including South Africa and Australia, where it is pushing out native species of trees.",
    ],
  },
  {
    stop: 8,
    name: "Juniper",
    latin: "Juniperus sp.",
    origin: "North America",
    observe: [
      ["Bark", "Long fibrous strands with a red hue, similar to western red cedar."],
      ["Needles", "Small and tightly packed. Some species of juniper have scales instead."],
      ["Cones", "Small, berry-like balls, often blue or green."],
    ],
    fun: [
      "Junipers show a large amount of variation in their foliage and growth forms, even within a single species. This is likely because the harsher environments they are adapted to require more variation across small distances.",
    ],
  },
  {
    stop: 9,
    name: "European beech",
    latin: "Fagus sylvatica",
    origin: "Europe",
    observe: [
      ["Bark", "Smooth and grey with specks of white that look like paint splatter."],
      ["Leaves", "Purple in mid-summer to fall, with hairs (pubescent) on the margins and underside."],
      ["Buds", "Very long, slender and pointy on the tips of branches."],
    ],
    fun: [
      "This is the same species of tree that we saw earlier in the tour. This variety, however, has the standard green colouring on its leaves and is also much younger, showing how different the form of the same species can be.",
    ],
  },
  {
    stop: 10,
    name: "Oriental plane",
    latin: "Platanus orientalis",
    origin: "Eastern Mediterranean",
    observe: [
      ["Bark", "Smooth on smaller branches and rough along older sections of the tree."],
      ["Leaves", "Look similar to maple leaves but are not closely related to maple trees."],
      ["Fruit", "Spiky balls the size of quail eggs."],
    ],
    fun: [
      "This specimen is a descendant of the “Hippocratic tree” from Kos, Greece, where Hippocrates, the “Father of medicine”, taught. This species is also one of the two crossed to make the London plane tree we saw at the start of the walk.",
    ],
    link: {
      href: "https://pediatrics.med.ubc.ca/2025/04/30/the-tree-of-hippocrates-at-bc-childrens-hospital/",
      label: "The Tree of Hippocrates at BC Children’s Hospital",
    },
  },
  {
    stop: 11,
    name: "Blue spruce",
    latin: "Picea pungens",
    origin: "Central and Southern Rocky Mountains",
    observe: [
      ["Bark", "Looks like dry, crackly skin or scabs."],
      ["Needles", "Evenly spread around the branch, with a light blue colour from a waxy coating."],
      ["Cones", "Small, with wavy, papery cone scales."],
    ],
    fun: [
      "Despite its small native range, this species is commonly planted in cities and has many smaller cultivars used in gardens. Its light blue colour comes from a wax coating on the needles that protects it against weather in its native habitat. The wax’s chemical makeup also changes with the seasons.",
    ],
  },
  {
    stop: 12,
    name: "Norway spruce",
    latin: "Picea abies",
    origin: "Northern and Central Europe",
    observe: [
      ["Bark", "Grey and scaly."],
      ["Needles", "Surround the branches evenly, with a dark green colour."],
      ["Cones", "Very long and large, with small thumbnail-shaped cone scales."],
    ],
    fun: [
      "Norway spruce is very cold tolerant and often found in very snowy regions. Its narrow silhouette and droopy branches prevent snow from building up and damaging the tree. It is the source of “spruce beer”, which was used to treat scurvy in sailors and soldiers before the 19th century.",
    ],
  },
  {
    stop: 13,
    name: "Scots pine",
    latin: "Pinus sylvestris",
    origin: "Europe",
    observe: [
      ["Bark", "Grey and plated, like overlapping puzzle pieces."],
      ["Needles", "In pairs that twist around each other."],
      ["Cones", "Small, with spiky points at the tip of each cone scale."],
    ],
    fun: [
      "You can identify a Scots pine by standing underneath it and looking up: there is an orange colouring on the underside of the branches.",
    ],
  },
  {
    stop: 14,
    name: "Chinese fir",
    latin: "Cunninghamia lanceolata",
    origin: "China",
    observe: [
      ["Bark", "Stringy, in long vertical lines."],
      ["Needles", "Lance-shaped (lanceolate) and aligned horizontally."],
      ["Cones", "Female cones look like roses or woody pineapples."],
    ],
    fun: [
      "The needles have two white “racing stripes” on the top and bottom. These are stomata, which allow for gas exchange. This is not really a fir: it belongs to the cypress family (Cupressaceae). Its wood is hard and highly resistant to insect damage.",
    ],
  },
];
