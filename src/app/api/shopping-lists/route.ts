import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 買い物リスト一覧取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data: shoppingLists, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        favorite_recipes (
          title,
          channel_name,
          thumbnail_url
        )
      `)
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ shoppingLists })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// 買い物リストアイテム追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      recipe_id,
      ingredient_name,
      quantity,
      unit,
      priority = 1,
      notes
    } = body

    if (!user_id || !ingredient_name) {
      return NextResponse.json(
        { error: 'User ID and ingredient name are required' },
        { status: 400 }
      )
    }

    const { data: shoppingItem, error } = await supabase
      .from('shopping_lists')
      .insert({
        user_id,
        recipe_id,
        ingredient_name,
        quantity,
        unit,
        priority,
        notes,
        is_purchased: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ shoppingItem }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// レシピから買い物リスト自動生成
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, recipe_id, recipe_title, missing_ingredients } = body

    if (!user_id || !recipe_id || !missing_ingredients) {
      return NextResponse.json(
        { error: 'User ID, recipe ID, and missing ingredients are required' },
        { status: 400 }
      )
    }

    // 複数のアイテムを一括挿入
    const shoppingItems = missing_ingredients.map((ingredient: {
      name: string
      quantity?: string
      unit?: string
    }) => ({
      user_id,
      recipe_id,
      ingredient_name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      priority: 2, // レシピから生成されたアイテムは優先度高め
      notes: `${recipe_title}のレシピより`,
      is_purchased: false,
    }))

    const { data: insertedItems, error } = await supabase
      .from('shopping_lists')
      .insert(shoppingItems)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Shopping list generated successfully',
      items: insertedItems 
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 