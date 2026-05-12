import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useToast } from '../../shared/contexts/toast/useToast'
import {
  FaHammer, FaWrench, FaTools, FaScrewdriver, FaPencilRuler,
  FaCog, FaCogs, FaBolt, FaPlug, FaLightbulb, FaSnowflake, FaFire,
  FaFaucet, FaTint, FaUmbrella, FaHardHat, FaShieldAlt,
  FaFireExtinguisher, FaMedkit, FaBuilding, FaIndustry, FaRoad,
  FaLayerGroup, FaCube, FaPaintRoller, FaBrush, FaSprayCan, FaTree,
  FaSeedling, FaDoorOpen, FaWindowMaximize,
  FaTruck, FaWarehouse, FaArchive, FaBarcode, FaTags, FaOilCan, FaGasPump,
  FaShoppingCart, FaShoppingBag, FaStore, FaCashRegister, FaGift, FaStar,
  FaTshirt, FaSocks, FaGlasses, FaUserTie,
  FaUtensils, FaCoffee, FaWineGlass, FaBeer, FaAppleAlt, FaPizzaSlice,
  FaCarrot, FaBreadSlice,
  FaSoap, FaToiletPaper, FaBroom, FaHandSparkles,
  FaPills, FaHeartbeat, FaStethoscope, FaBandAid, FaTablets,
  FaDumbbell, FaRunning, FaFutbol, FaBicycle, FaSwimmer, FaGamepad,
  FaMobileAlt, FaTabletAlt, FaTv, FaCamera, FaHeadset,
  FaLaptop, FaMouse, FaHeadphones, FaHdd, FaMemory,
  FaPaw, FaDog, FaCat, FaFish,
  FaCar, FaMotorcycle,
  FaBook, FaPen, FaPencilAlt, FaCalculator, FaPrint,
  FaCouch, FaChair,
  FaHome, FaBaby, FaChild, FaHeart,
  FaBox,
} from 'react-icons/fa'
import './CreateCategoryModal.sass'

interface Category {
  id: number
  nome: string
  iconName: string
}

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (category: Omit<Category, 'id'>) => void
}

interface IconOption {
  name: string
  icon: React.ReactNode
  label: string
}

interface IconGroup {
  label: string
  options: IconOption[]
}

const iconGroups: IconGroup[] = [
  {
    label: 'Varejo e Comércio',
    options: [
      { name: 'store',        icon: <FaStore size={20} />,            label: 'Loja'          },
      { name: 'shoppingcart', icon: <FaShoppingCart size={20} />,     label: 'Carrinho'      },
      { name: 'shoppingbag',  icon: <FaShoppingBag size={20} />,      label: 'Sacola'        },
      { name: 'cashregister', icon: <FaCashRegister size={20} />,     label: 'Caixa'         },
      { name: 'tags',         icon: <FaTags size={20} />,             label: 'Etiquetas'     },
      { name: 'gift',         icon: <FaGift size={20} />,             label: 'Presente'      },
      { name: 'star',         icon: <FaStar size={20} />,             label: 'Destaque'      },
      { name: 'barcode',      icon: <FaBarcode size={20} />,          label: 'Cód. Barras'   },
    ],
  },
  {
    label: 'Moda e Vestuário',
    options: [
      { name: 'tshirt',       icon: <FaTshirt size={20} />,           label: 'Roupas'        },
      { name: 'socks',        icon: <FaSocks size={20} />,            label: 'Meias'         },
      { name: 'glasses',      icon: <FaGlasses size={20} />,          label: 'Óculos'        },
      { name: 'usertie',      icon: <FaUserTie size={20} />,          label: 'Formal'        },
    ],
  },
  {
    label: 'Alimentação e Bebidas',
    options: [
      { name: 'utensils',     icon: <FaUtensils size={20} />,         label: 'Alimentação'   },
      { name: 'coffee',       icon: <FaCoffee size={20} />,           label: 'Café'          },
      { name: 'beer',         icon: <FaBeer size={20} />,             label: 'Bebidas'       },
      { name: 'wineglass',    icon: <FaWineGlass size={20} />,        label: 'Vinho'         },
      { name: 'applealt',     icon: <FaAppleAlt size={20} />,         label: 'Hortifrúti'    },
      { name: 'carrot',       icon: <FaCarrot size={20} />,           label: 'Verduras'      },
      { name: 'breadslice',   icon: <FaBreadSlice size={20} />,       label: 'Padaria'       },
      { name: 'pizzaslice',   icon: <FaPizzaSlice size={20} />,       label: 'Alimentos'     },
    ],
  },
  {
    label: 'Limpeza e Higiene',
    options: [
      { name: 'soap',         icon: <FaSoap size={20} />,             label: 'Sabão'         },
      { name: 'handsparkles', icon: <FaHandSparkles size={20} />,     label: 'Higiene'       },
      { name: 'broom',        icon: <FaBroom size={20} />,            label: 'Limpeza'       },
      { name: 'toiletpaper',  icon: <FaToiletPaper size={20} />,      label: 'Papel Hig.'    },
      { name: 'spray',        icon: <FaSprayCan size={20} />,         label: 'Spray'         },
    ],
  },
  {
    label: 'Saúde e Farmácia',
    options: [
      { name: 'pills',        icon: <FaPills size={20} />,            label: 'Medicamentos'  },
      { name: 'tablets',      icon: <FaTablets size={20} />,          label: 'Comprimidos'   },
      { name: 'heartbeat',    icon: <FaHeartbeat size={20} />,        label: 'Saúde'         },
      { name: 'stethoscope',  icon: <FaStethoscope size={20} />,      label: 'Médico'        },
      { name: 'bandaid',      icon: <FaBandAid size={20} />,          label: 'Primeiros S.'  },
    ],
  },
  {
    label: 'Doméstico e Família',
    options: [
      { name: 'home',         icon: <FaHome size={20} />,             label: 'Casa'          },
      { name: 'couch',        icon: <FaCouch size={20} />,            label: 'Mobiliário'    },
      { name: 'chair',        icon: <FaChair size={20} />,            label: 'Cadeira'       },
      { name: 'baby',         icon: <FaBaby size={20} />,             label: 'Bebê'          },
      { name: 'child',        icon: <FaChild size={20} />,            label: 'Criança'       },
      { name: 'heart',        icon: <FaHeart size={20} />,            label: 'Favoritos'     },
    ],
  },
  {
    label: 'Pets',
    options: [
      { name: 'paw',          icon: <FaPaw size={20} />,              label: 'Pet Geral'     },
      { name: 'dog',          icon: <FaDog size={20} />,              label: 'Cão'           },
      { name: 'cat',          icon: <FaCat size={20} />,              label: 'Gato'          },
      { name: 'fish',         icon: <FaFish size={20} />,             label: 'Peixe'         },
    ],
  },
  {
    label: 'Esportes e Lazer',
    options: [
      { name: 'dumbbell',     icon: <FaDumbbell size={20} />,         label: 'Academia'      },
      { name: 'running',      icon: <FaRunning size={20} />,          label: 'Corrida'       },
      { name: 'futbol',       icon: <FaFutbol size={20} />,           label: 'Futebol'       },
      { name: 'bicycle',      icon: <FaBicycle size={20} />,          label: 'Ciclismo'      },
      { name: 'swimmer',      icon: <FaSwimmer size={20} />,          label: 'Natação'       },
      { name: 'gamepad',      icon: <FaGamepad size={20} />,          label: 'Games'         },
    ],
  },
  {
    label: 'Eletrônicos e Telefonia',
    options: [
      { name: 'mobilealt',    icon: <FaMobileAlt size={20} />,        label: 'Celular'       },
      { name: 'tabletalt',    icon: <FaTabletAlt size={20} />,        label: 'Tablet'        },
      { name: 'tv',           icon: <FaTv size={20} />,               label: 'TV'            },
      { name: 'camera',       icon: <FaCamera size={20} />,           label: 'Câmera'        },
      { name: 'laptop',       icon: <FaLaptop size={20} />,           label: 'Laptop'        },
      { name: 'headset',      icon: <FaHeadset size={20} />,          label: 'Headset'       },
      { name: 'headphones',   icon: <FaHeadphones size={20} />,       label: 'Fone'          },
      { name: 'mouse',        icon: <FaMouse size={20} />,            label: 'Mouse'         },
      { name: 'hdd',          icon: <FaHdd size={20} />,              label: 'HDD'           },
      { name: 'memory',       icon: <FaMemory size={20} />,           label: 'Memória'       },
    ],
  },
  {
    label: 'Automotivo',
    options: [
      { name: 'car',          icon: <FaCar size={20} />,              label: 'Carro'         },
      { name: 'motorcycle',   icon: <FaMotorcycle size={20} />,       label: 'Moto'          },
      { name: 'truck',        icon: <FaTruck size={20} />,            label: 'Caminhão'      },
      { name: 'gaspump',      icon: <FaGasPump size={20} />,          label: 'Combustível'   },
      { name: 'oilcan',       icon: <FaOilCan size={20} />,           label: 'Lubrificante'  },
    ],
  },
  {
    label: 'Papelaria e Educação',
    options: [
      { name: 'book',         icon: <FaBook size={20} />,             label: 'Livros'        },
      { name: 'pen',          icon: <FaPen size={20} />,              label: 'Caneta'        },
      { name: 'pencilalt',    icon: <FaPencilAlt size={20} />,        label: 'Lápis'         },
      { name: 'calculator',   icon: <FaCalculator size={20} />,       label: 'Calculadora'   },
      { name: 'print',        icon: <FaPrint size={20} />,            label: 'Impressora'    },
      { name: 'archive',      icon: <FaArchive size={20} />,          label: 'Arquivo'       },
    ],
  },
  {
    label: 'Construção Civil',
    options: [
      { name: 'hammer',       icon: <FaHammer size={20} />,           label: 'Martelo'       },
      { name: 'wrench',       icon: <FaWrench size={20} />,           label: 'Chave'         },
      { name: 'tools',        icon: <FaTools size={20} />,            label: 'Ferramentas'   },
      { name: 'screwdriver',  icon: <FaScrewdriver size={20} />,      label: 'Parafuso'      },
      { name: 'ruler',        icon: <FaPencilRuler size={20} />,      label: 'Medição'       },
      { name: 'cog',          icon: <FaCog size={20} />,              label: 'Mecânica'      },
      { name: 'cogs',         icon: <FaCogs size={20} />,             label: 'Maquinário'    },
      { name: 'bolt',         icon: <FaBolt size={20} />,             label: 'Elétrico'      },
      { name: 'plug',         icon: <FaPlug size={20} />,             label: 'Tomada'        },
      { name: 'lightbulb',    icon: <FaLightbulb size={20} />,        label: 'Iluminação'    },
      { name: 'snowflake',    icon: <FaSnowflake size={20} />,        label: 'Refrigeração'  },
      { name: 'fire',         icon: <FaFire size={20} />,             label: 'Aquecimento'   },
      { name: 'faucet',       icon: <FaFaucet size={20} />,           label: 'Hidráulico'    },
      { name: 'water',        icon: <FaTint size={20} />,             label: 'Água'          },
      { name: 'umbrella',     icon: <FaUmbrella size={20} />,         label: 'Impermeab.'    },
      { name: 'hardhat',      icon: <FaHardHat size={20} />,          label: 'EPI'           },
      { name: 'shield',       icon: <FaShieldAlt size={20} />,        label: 'Proteção'      },
      { name: 'extinguisher', icon: <FaFireExtinguisher size={20} />, label: 'Extintor'      },
      { name: 'medkit',       icon: <FaMedkit size={20} />,           label: 'Primeiros S.'  },
      { name: 'building',     icon: <FaBuilding size={20} />,         label: 'Construção'    },
      { name: 'industry',     icon: <FaIndustry size={20} />,         label: 'Industrial'    },
      { name: 'road',         icon: <FaRoad size={20} />,             label: 'Pavimentação'  },
      { name: 'layers',       icon: <FaLayerGroup size={20} />,       label: 'Revestimento'  },
      { name: 'cube',         icon: <FaCube size={20} />,             label: 'Material'      },
      { name: 'paint',        icon: <FaPaintRoller size={20} />,      label: 'Pintura'       },
      { name: 'brush',        icon: <FaBrush size={20} />,            label: 'Pincel'        },
      { name: 'tree',         icon: <FaTree size={20} />,             label: 'Madeira'       },
      { name: 'seedling',     icon: <FaSeedling size={20} />,         label: 'Paisagismo'    },
      { name: 'door',         icon: <FaDoorOpen size={20} />,         label: 'Portas'        },
      { name: 'window',       icon: <FaWindowMaximize size={20} />,   label: 'Janelas'       },
      { name: 'warehouse',    icon: <FaWarehouse size={20} />,        label: 'Armazém'       },
    ],
  },
  {
    label: 'Geral',
    options: [
      { name: 'box',          icon: <FaBox size={20} />,              label: 'Geral'         },
    ],
  },
]

export function CreateCategoryModal({
  isOpen,
  onClose,
  onCreate,
}: CreateCategoryModalProps) {
  const toast = useToast()
  const [nome, setNome] = useState('')
  const [groupIndex, setGroupIndex] = useState(0)
  const [selectedIcon, setSelectedIcon] = useState<string>(iconGroups[0].options[0].name)

  const currentGroup = iconGroups[groupIndex]
  const selectedOption = currentGroup.options.find((o) => o.name === selectedIcon)

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value)
    setGroupIndex(idx)
    setSelectedIcon(iconGroups[idx].options[0].name)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast.warning('Por favor, preencha o nome da categoria')
      return
    }
    onCreate({ nome: nome.trim(), iconName: selectedIcon })
    reset()
    onClose()
  }

  const reset = () => {
    setNome('')
    setGroupIndex(0)
    setSelectedIcon(iconGroups[0].options[0].name)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="create-category-modal-overlay" onClick={handleClose}>
      <div className="create-category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-category-modal__header">
          <h2 className="create-category-modal__title">Criar Categoria</h2>
          <button className="create-category-modal__close" onClick={handleClose} title="Fechar">
            <FaTimes size={20} />
          </button>
        </div>

        <form className="create-category-modal__form" onSubmit={handleSubmit}>
          <div className="create-category-modal__content">

            <div className="create-category-modal__form-group">
              <label className="create-category-modal__form-label">Nome da Categoria *</label>
              <input
                type="text"
                className="create-category-modal__form-input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Digite o nome da categoria"
                autoFocus
              />
            </div>

            <div className="create-category-modal__form-group">
              <label className="create-category-modal__form-label">Ícone *</label>

              <select
                className="create-category-modal__group-select"
                value={groupIndex}
                onChange={handleGroupChange}
              >
                {iconGroups.map((g, i) => (
                  <option key={g.label} value={i}>{g.label}</option>
                ))}
              </select>

              <div className="create-category-modal__icon-grid">
                {currentGroup.options.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    className={`create-category-modal__icon-item ${selectedIcon === option.name ? 'create-category-modal__icon-item--selected' : ''}`}
                    onClick={() => setSelectedIcon(option.name)}
                    title={option.label}
                  >
                    <span className="create-category-modal__icon-item-icon">{option.icon}</span>
                    <span className="create-category-modal__icon-item-label">{option.label}</span>
                  </button>
                ))}
              </div>

              {selectedOption && (
                <div className="create-category-modal__icon-preview">
                  <span className="create-category-modal__icon-preview-icon">{selectedOption.icon}</span>
                  <span className="create-category-modal__icon-preview-text">
                    {selectedOption.label} — {currentGroup.label}
                  </span>
                </div>
              )}
            </div>

          </div>

          <div className="create-category-modal__footer">
            <button
              type="button"
              className="create-category-modal__button create-category-modal__button--secondary"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="create-category-modal__button create-category-modal__button--primary"
            >
              Criar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
