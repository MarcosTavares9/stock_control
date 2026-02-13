import { useState, useEffect } from 'react'
import { FaTimes, FaUpload, FaFileExcel, FaDownload } from 'react-icons/fa'
import { listCategories } from '../categories/categories.service'
import { listLocalizacoes } from '../location/location.service'
import type { Category } from '../categories/categories.types'
import type { Localizacao } from '../location/location.types'
import { ImageUpload } from '../../shared/components/ImageUpload/ImageUpload'
import { useToast } from '../../shared/contexts/ToastContext'
import './CreateProductModal.sass'

interface Product {
  id: string
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  localizacao: string
  status: 'ok' | 'baixo' | 'vazio'
  imagem?: string
}

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (product: Omit<Product, 'id' | 'status'>) => void
  onCreateMultiple: (products: Omit<Product, 'id' | 'status'>[]) => void
  categorias: string[]
}

export function CreateProductModal({
  isOpen,
  onClose,
  onCreate,
  onCreateMultiple,
  categorias: _categorias
}: CreateProductModalProps) {
  const toast = useToast()
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [localizacao, setLocalizacao] = useState('')
  const [quantidadeInput, setQuantidadeInput] = useState<string>('')
  const [estoqueMinimoInput, setEstoqueMinimoInput] = useState<string>('')
  const [imagem, setImagem] = useState<string | undefined>(undefined)
  const [listaManual, setListaManual] = useState('')
  const [arquivoExcel, setArquivoExcel] = useState<File | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Localizacao[]>([])

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [categoriesData, locationsData] = await Promise.all([
            listCategories(),
            listLocalizacoes(true) // Apenas localizações ativas
          ])
          setCategories(categoriesData)
          setLocations(locationsData)
        } catch (error) {
          console.error('Erro ao carregar categorias e localizações:', error)
        }
      }
      loadData()
    }
  }, [isOpen])

  const parseManualList = (text: string): Omit<Product, 'id' | 'status'>[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const products: Omit<Product, 'id' | 'status'>[] = []

    lines.forEach((line, index) => {
      // Formato esperado: Nome | Categoria | Localização | Quantidade | Estoque Mínimo
      // Ou separado por vírgula ou tab
      const parts = line.split(/[,\t|]/).map(p => p.trim()).filter(p => p)
      
      if (parts.length >= 3) {
        products.push({
          nome: parts[0] || `Produto ${index + 1}`,
          categoria: parts[1] || 'Geral',
          localizacao: parts[2] || 'A1-1',
          quantidade: parts[3] ? parseInt(parts[3]) || 0 : 0,
          estoqueMinimo: parts[4] ? parseInt(parts[4]) || 0 : 0
        })
      }
    })

    return products
  }

  const parseExcelFile = (file: File): Promise<Omit<Product, 'id' | 'status'>[]> => {
    return new Promise(async (resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string
          
          // Se for CSV, processar diretamente
          if (file.name.endsWith('.csv')) {
            const products = parseCSV(text)
            resolve(products)
            return
          }
          
          // Para Excel, tentar carregar xlsx dinamicamente
          try {
            // Usar Function constructor para evitar análise estática do Vite
            const dynamicImport = new Function('module', 'return import(module)')
            const XLSX = await dynamicImport('xlsx')
            
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[]

            const products: Omit<Product, 'id' | 'status'>[] = jsonData.map((row: any) => ({
              nome: row['Nome'] || row['nome'] || row['Nome do Produto'] || '',
              categoria: row['Categoria'] || row['categoria'] || 'Geral',
              localizacao: row['Localização'] || row['localizacao'] || row['Localizacao'] || 'A1-1',
              quantidade: parseInt(row['Quantidade'] || row['quantidade'] || 0) || 0,
              estoqueMinimo: parseInt(row['Estoque Mínimo'] || row['Estoque Minimo'] || row['estoqueMinimo'] || row['Estoque Mínimo'] || 0) || 0
            })).filter(p => p.nome)

            resolve(products)
          } catch (excelError) {
            reject(new Error('Erro ao processar arquivo Excel. Por favor, salve como CSV e tente novamente, ou use a lista manual.'))
          }
        } catch (error) {
          reject(new Error('Erro ao processar arquivo. Verifique o formato.'))
        }
      }

      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'))
      
      // Ler como texto para CSV, como ArrayBuffer para Excel
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const parseCSV = (csvText: string): Omit<Product, 'id' | 'status'>[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return []

    // Detectar separador (vírgula ou ponto e vírgula)
    const separator = csvText.includes(';') ? ';' : ','
    
    // Primeira linha pode ser cabeçalho
    const hasHeader = lines[0].toLowerCase().includes('nome') || lines[0].toLowerCase().includes('categoria')
    const dataLines = hasHeader ? lines.slice(1) : lines

    const products: Omit<Product, 'id' | 'status'>[] = []

    dataLines.forEach((line, index) => {
      const parts = line.split(separator).map(p => p.trim().replace(/^["']|["']$/g, ''))
      
      if (parts.length >= 3) {
        products.push({
          nome: parts[0] || `Produto ${index + 1}`,
          categoria: parts[1] || 'Geral',
          localizacao: parts[2] || 'A1-1',
          quantidade: parts[3] ? parseInt(parts[3]) || 0 : 0,
          estoqueMinimo: parts[4] ? parseInt(parts[4]) || 0 : 0
        })
      }
    })

    return products.filter(p => p.nome)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'single') {
      const quantidade = quantidadeInput === '' ? 0 : parseInt(quantidadeInput) || 0
      const estoqueMinimo = estoqueMinimoInput === '' ? 0 : parseInt(estoqueMinimoInput) || 0

      onCreate({
        nome,
        categoria,
        localizacao,
        quantidade,
        estoqueMinimo,
        imagem
      })

      // Limpar formulário
      setNome('')
      setCategoria('')
      setLocalizacao('')
      setQuantidadeInput('')
      setEstoqueMinimoInput('')
      setImagem(undefined)
      onClose()
    } else {
      // Modo bulk
      let products: Omit<Product, 'id' | 'status'>[] = []

      if (arquivoExcel) {
        try {
          products = await parseExcelFile(arquivoExcel)
        } catch (error) {
          toast.error('Erro ao processar arquivo Excel. Verifique o formato do arquivo.')
          return
        }
      } else if (listaManual.trim()) {
        products = parseManualList(listaManual)
      }

      if (products.length === 0) {
        toast.warning('Nenhum produto válido encontrado. Verifique os dados inseridos.')
        return
      }

      onCreateMultiple(products)
      
      // Limpar formulário
      setListaManual('')
      setArquivoExcel(null)
      onClose()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
        setArquivoExcel(file)
        setListaManual('') // Limpar lista manual quando selecionar arquivo
      } else {
        toast.warning('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV (.csv)')
        e.target.value = ''
      }
    }
  }

  const handleDownloadTemplate = () => {
    // Criar conteúdo CSV com cabeçalho e exemplos
    const csvContent = [
      'Nome,Categoria,Localização,Quantidade,Estoque Mínimo',
      'Notebook Dell Inspiron,Eletrônicos,A1-1,10,5',
      'Mouse Logitech,Periféricos,A2-1,20,10',
      'Teclado Mecânico,Periféricos,A3-1,15,8',
      'Monitor LG 27",Eletrônicos,B1-1,5,3',
      'Webcam HD,Periféricos,B2-1,12,6'
    ].join('\n')

    // Criar blob e fazer download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'modelo_produtos.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    // Limpar formulário ao fechar
    setNome('')
    setCategoria('')
    setLocalizacao('')
    setQuantidadeInput('')
    setEstoqueMinimoInput('')
    setImagem(undefined)
    setListaManual('')
    setArquivoExcel(null)
    setMode('single')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="create-product-modal-overlay" onClick={handleClose}>
      <div className="create-product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-product-modal__header">
          <h2 className="create-product-modal__title">Criar Produto(s)</h2>
          <button 
            className="create-product-modal__close"
            onClick={handleClose}
            title="Fechar"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="create-product-modal__tabs">
          <button
            type="button"
            className={`create-product-modal__tab ${mode === 'single' ? 'create-product-modal__tab--active' : ''}`}
            onClick={() => setMode('single')}
          >
            Produto Único
          </button>
          <button
            type="button"
            className={`create-product-modal__tab ${mode === 'bulk' ? 'create-product-modal__tab--active' : ''}`}
            onClick={() => setMode('bulk')}
          >
            Importar Lista
          </button>
        </div>

        <form className="create-product-modal__form" onSubmit={handleSubmit}>
          <div className="create-product-modal__content">
            {mode === 'single' ? (
              <>
                <div className="create-product-modal__form-group">
                  <label className="create-product-modal__form-label">Nome *</label>
                  <input
                    type="text"
                    className="create-product-modal__form-input"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    placeholder="Digite o nome do produto"
                  />
                </div>
                
                <div className="create-product-modal__form-group">
                  <label className="create-product-modal__form-label">Categoria *</label>
                  <select
                    className="create-product-modal__form-input"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.uuid} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="create-product-modal__form-group">
                  <label className="create-product-modal__form-label">Localização *</label>
                  <select
                    className="create-product-modal__form-input"
                    value={localizacao}
                    onChange={(e) => setLocalizacao(e.target.value)}
                    required
                  >
                    <option value="">Selecione uma localização</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.nome}>
                        {loc.nome}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="create-product-modal__form-row">
                  <div className="create-product-modal__form-group">
                    <label className="create-product-modal__form-label">Quantidade</label>
                    <input
                      type="number"
                      className="create-product-modal__form-input"
                      value={quantidadeInput}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || /^\d+$/.test(value)) {
                          setQuantidadeInput(value)
                        }
                      }}
                      min="0"
                      placeholder="Digite o valor"
                    />
                  </div>
                  
                  <div className="create-product-modal__form-group">
                    <label className="create-product-modal__form-label">Estoque Mínimo</label>
                    <input
                      type="number"
                      className="create-product-modal__form-input"
                      value={estoqueMinimoInput}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || /^\d+$/.test(value)) {
                          setEstoqueMinimoInput(value)
                        }
                      }}
                      min="0"
                      placeholder="Digite o valor"
                    />
                  </div>
                </div>

                <div className="create-product-modal__form-group">
                  <label className="create-product-modal__form-label">Imagem do Produto</label>
                  <ImageUpload
                    currentImageUrl={null}
                    onImageUploaded={(url) => setImagem(url)}
                    onImageRemoved={() => setImagem(undefined)}
                    folder="products"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="create-product-modal__form-group">
                  <div className="create-product-modal__label-row">
                    <label className="create-product-modal__form-label">
                      <FaFileExcel size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Upload de Arquivo (Excel ou CSV)
                    </label>
                    <button
                      type="button"
                      className="create-product-modal__download-button"
                      onClick={handleDownloadTemplate}
                      title="Baixar modelo CSV"
                    >
                      <FaDownload size={14} />
                      Baixar Modelo
                    </button>
                  </div>
                  <div className="create-product-modal__file-upload">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="create-product-modal__file-input"
                      id="excel-upload"
                    />
                    <label htmlFor="excel-upload" className="create-product-modal__file-label">
                      <FaUpload size={18} />
                      {arquivoExcel ? arquivoExcel.name : 'Selecionar arquivo (.xlsx, .xls ou .csv)'}
                    </label>
                  </div>
                  <p className="create-product-modal__help-text">
                    O arquivo deve conter colunas: Nome, Categoria, Localização, Quantidade, Estoque Mínimo
                    <br />
                    <strong>Dica:</strong> Baixe o modelo acima, preencha e importe. CSV funciona melhor.
                  </p>
                </div>

                <div className="create-product-modal__divider">
                  <span>OU</span>
                </div>

                <div className="create-product-modal__form-group">
                  <label className="create-product-modal__form-label">
                    Lista Manual de Produtos
                  </label>
                  <textarea
                    className="create-product-modal__textarea"
                    value={listaManual}
                    onChange={(e) => {
                      setListaManual(e.target.value)
                      setArquivoExcel(null) // Limpar arquivo quando digitar manualmente
                    }}
                    placeholder="Digite um produto por linha no formato:&#10;Nome | Categoria | Localização | Quantidade | Estoque Mínimo&#10;&#10;Exemplo:&#10;Notebook Dell | Eletrônicos | A1-1 | 10 | 5&#10;Mouse Logitech | Periféricos | A2-1 | 20 | 10"
                    rows={10}
                  />
                  <p className="create-product-modal__help-text">
                    Formato: Nome | Categoria | Localização | Quantidade | Estoque Mínimo (separado por | ou vírgula)
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="create-product-modal__footer">
            <button
              type="button"
              className="create-product-modal__button create-product-modal__button--secondary"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="create-product-modal__button create-product-modal__button--primary"
            >
              {mode === 'single' ? 'Criar Produto' : 'Importar Produtos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

