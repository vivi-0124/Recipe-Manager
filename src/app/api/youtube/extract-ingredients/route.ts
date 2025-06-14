import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    // 材料抽出の正規表現パターン
    const ingredients = extractIngredients(description)

    return NextResponse.json({ ingredients })
  } catch (error) {
    console.error('Ingredient extraction error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractIngredients(description: string): string[] {
  const ingredients: string[] = []
  
  // 説明文を行ごとに分割
  const lines = description.split('\n')
  
  // 材料セクションを見つけるためのキーワード
  const materialKeywords = [
    '材料', '食材', '具材', 'Ingredients', 'ingredients',
    '＜材料＞', '【材料】', '■材料', '★材料', '☆材料',
    '＜食材＞', '【食材】', '■食材', '★食材', '☆食材'
  ]
  
  // 材料セクションの終了を示すキーワード
  const endKeywords = [
    '作り方', '手順', '調理法', 'Instructions', 'Method',
    '＜作り方＞', '【作り方】', '■作り方', '★作り方',
    '＜手順＞', '【手順】', '■手順', '★手順'
  ]
  
  let inMaterialSection = false
  let foundMaterialSection = false
  
  for (const line of lines) {
    const cleanLine = line.trim()
    
    // 空行はスキップ
    if (!cleanLine) continue
    
    // 材料セクションの開始を検出
    if (!foundMaterialSection && materialKeywords.some(keyword => 
      cleanLine.includes(keyword) || cleanLine.toLowerCase().includes(keyword.toLowerCase())
    )) {
      inMaterialSection = true
      foundMaterialSection = true
      continue
    }
    
    // 材料セクションの終了を検出
    if (inMaterialSection && endKeywords.some(keyword => 
      cleanLine.includes(keyword) || cleanLine.toLowerCase().includes(keyword.toLowerCase())
    )) {
      break
    }
    
    // 材料セクション内の場合
    if (inMaterialSection) {
      // 材料っぽい行を抽出（数量+材料名のパターン）
      const ingredientMatch = extractIngredientFromLine(cleanLine)
      if (ingredientMatch) {
        ingredients.push(ingredientMatch)
      }
    }
  }
  
  // 材料セクションが見つからない場合、全体から材料っぽい行を抽出
  if (!foundMaterialSection) {
    for (const line of lines) {
      const cleanLine = line.trim()
      if (!cleanLine) continue
      
      const ingredientMatch = extractIngredientFromLine(cleanLine)
      if (ingredientMatch) {
        ingredients.push(ingredientMatch)
      }
    }
  }
  
  // 重複を除去して最大15個まで
  return [...new Set(ingredients)].slice(0, 15)
}

function extractIngredientFromLine(line: string): string | null {
  // URLや時間を含む行はスキップ
  if (line.includes('http') || line.includes('www.') || /\d+:\d+/.test(line)) {
    return null
  }
  
  // チャンネル情報や宣伝文句をスキップ
  if (line.includes('チャンネル登録') || line.includes('Subscribe') || 
      line.includes('いいね') || line.includes('Like') ||
      line.includes('コメント') || line.includes('Comment')) {
    return null
  }
  
  // 材料らしいパターンを検出
  const patterns = [
    // 数量 + 材料名のパターン
    /^[・•\-\*]\s*(.+?)\s*[:\s]\s*(.+)$/,
    /^(\d+\S*|\S+)\s+(.+)$/,
    /^(.+?)\s*[:\s]\s*(\d+\S*|\S+)$/,
    // シンプルな材料名
    /^[・•\-\*]\s*(.+)$/,
    // 括弧内に分量があるパターン
    /^(.+?)\s*\((.+?)\)$/,
    /^(.+?)\s*（(.+?)）$/
  ]
  
  for (const pattern of patterns) {
    const match = line.match(pattern)
    if (match) {
      let ingredient = ''
      
      if (match.length === 2) {
        // シンプルなパターン
        ingredient = match[1].trim()
      } else if (match.length === 3) {
        // 数量 + 材料名 or 材料名 + 数量
        const part1 = match[1].trim()
        const part2 = match[2].trim()
        
        // より材料名らしい方を選択
        if (isIngredientName(part1) && !isIngredientName(part2)) {
          ingredient = part1
        } else if (!isIngredientName(part1) && isIngredientName(part2)) {
          ingredient = part2
        } else {
          // 両方とも材料名らしい場合は組み合わせる
          ingredient = `${part1} ${part2}`
        }
      }
      
      // 最終的な材料名の検証
      if (ingredient && isValidIngredient(ingredient)) {
        return ingredient.length > 50 ? ingredient.substring(0, 50) + '...' : ingredient
      }
    }
  }
  
  return null
}

function isIngredientName(text: string): boolean {
  // 数量っぽい文字列かどうかチェック
  const quantityPattern = /^[\d\s\.\,]+[gmlccp個枚本匙杯カップ大小中少々適量]?$/
  return !quantityPattern.test(text)
}

function isValidIngredient(ingredient: string): boolean {
  // 最小長チェック
  if (ingredient.length < 2) return false
  
  // 無効なパターンをチェック
  const invalidPatterns = [
    /^[\d\s\.\,\(\)（）]+$/,  // 数字のみ
    /^[a-zA-Z\s]+$/,         // アルファベットのみ（日本語の料理なので）
    /動画|チャンネル|登録|いいね|コメント|概要|詳細/,  // 動画関連ワード
  ]
  
  return !invalidPatterns.some(pattern => pattern.test(ingredient))
} 