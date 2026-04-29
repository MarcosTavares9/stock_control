import {
  FaLaptop,
  FaMouse,
  FaHeadphones,
  FaHdd,
  FaMemory,
  FaChair,
  FaPrint,
  FaSprayCan,
  FaUtensils,
  FaTshirt,
  FaBox,
} from 'react-icons/fa'

export function getCategoryIcon(iconName?: string, size = 32): React.ReactNode {
  const key = iconName?.toLowerCase() ?? ''

  const iconMap: Record<string, React.ReactNode> = {
    laptop: <FaLaptop size={size} />,
    mouse: <FaMouse size={size} />,
    headphones: <FaHeadphones size={size} />,
    hdd: <FaHdd size={size} />,
    memory: <FaMemory size={size} />,
    chair: <FaChair size={size} />,
    print: <FaPrint size={size} />,
    spray: <FaSprayCan size={size} />,
    spraycan: <FaSprayCan size={size} />,
    utensils: <FaUtensils size={size} />,
    tshirt: <FaTshirt size={size} />,
    box: <FaBox size={size} />,
    electronics: <FaLaptop size={size} />,
    computer: <FaLaptop size={size} />,
    furniture: <FaChair size={size} />,
    office: <FaPrint size={size} />,
    cleaning: <FaSprayCan size={size} />,
  }

  return iconMap[key] ?? <FaBox size={size} />
}
