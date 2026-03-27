namespace PhoneShop.API.Models
{
    public class NewsCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }

        public List<NewsCategoryMapping> NewsMappings { get; set; } = new List<NewsCategoryMapping>();
    }
}
