"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import RecipeCard from '../../components/RecipeCard';
import EditRecipeCard from '@/components/EditRecipeCard';

function SavedRecipesPage() {
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<string>>(new Set());
  const [editingRecipe, setEditingRecipe] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (session) {
      setIsLoading(true);
      axios
        .get("/api/getSavedRecipes")
        .then((res) => {
          const fetchedRecipes = res.data;
          setRecipes(fetchedRecipes);
          setFavoritedRecipes(new Set(fetchedRecipes.map((recipe: any) => recipe.id)));
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const handleFavoriteToggle = async (recipe: any) => {
    if (!session) {
      alert('You need to be logged in to modify your favorites.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to remove this recipe from your favorites?'
    );
    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`/api/deleteRecipe?recipeId=${recipe.id}`);

      setRecipes((prevRecipes) =>
        prevRecipes.filter((r) => r.id !== recipe.id)
      );

      setFavoritedRecipes((prev) => {
        const updated = new Set(prev);
        updated.delete(recipe.id);
        return updated;
      });

      alert('Recipe removed from your favorites!');
    } catch (error) {
      console.error('Error removing recipe from favorites:', error);
      alert('Failed to remove recipe from favorites.');
    }
  };

  const handleEditRecipe = (recipe: any) => {
    setEditingRecipe(recipe);
  };

  const handleSaveEditedRecipe = (editedRecipe: any) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === editedRecipe.id ? editedRecipe : recipe
      )
    );
    setEditingRecipe(null);
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 mx-auto mb-4 text-indigo-500" />
          <p className="text-gray-600">Loading your favorite recipes...</p>
        </div>
      </div>
    );
  }

  if (!session) return <p>You need to be logged in to view this page.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Favorite Recipes
        </h1>

        {editingRecipe ? (
          <EditRecipeCard
            recipe={editingRecipe}
            onSave={handleSaveEditedRecipe}
            onCancel={handleCancelEdit}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorited={true}
                  onFavoriteToggle={handleFavoriteToggle}
                  ingredientVariants={[]}
                  disableIngredientColor={true}
                  onEditRecipe={handleEditRecipe}
                />
              ))
            ) : (
              <p className="text-center text-gray-600">No saved recipes found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedRecipesPage;